var Quiz = function (dataFrame) {
	this.loadAll(dataFrame);

	this.numRight = 0;
	this.numWrong = 0;

	this.currentSlice = [];
};

Quiz.SLICE_SIZE = 10;

Quiz.prototype = new Object();

Quiz.prototype.loadAll = function (dataFrame) {
	this.rawteammates = [];

	var htmlElems = $(dataFrame[0].contentDocument.body).find(".team-member");

	for (var i=0; i < htmlElems.length; i++) {
		var teammate = $(htmlElems[i]);
		var out = {img: teammate.find("img").attr("src"),
				   name: teammate.find(".name").text(),
				   title: teammate.find(".title").text(),
				   };

		this.rawteammates.push(out);
	}

  this.incorrectOrUnanswered = this.rawteammates.slice();
};

Quiz.prototype.autocomplete = function (text, max) {
	var outSet = [];

	text = text.toLowerCase();

	for (var i=0; i < this.rawteammates.length; i++) {
		if (this.rawteammates[i].name.toLowerCase().indexOf(text) !== -1) {
			outSet.push(this.rawteammates[i]);

			if (outSet.length >= max)
				break;
		}
	}

	return outSet;
};

Quiz.prototype.getPercentage = function () {
  return (this.numRight + this.numWrong) ? Math.floor((this.numRight / (this.numRight + this.numWrong)) * 100) : 0;
};

Quiz.prototype.numLeft = function () {
  return this.incorrectOrUnanswered.length;
};

Quiz.prototype.loadGuesses = function (guesses) {
  var removeSet = {};

  for (var i=0; i < guesses.length; i++) {
    var g = guesses[i];

    if (g.correct) {
      removeSet[g.name] = true;
      this.numRight++;
    }

    this.numWrong += g.wrongTimes;
  }

  // remove correct guesses
  for (var i=0; i < this.incorrectOrUnanswered.length; i++) {
    if (removeSet[this.incorrectOrUnanswered[i].name]) {
      this.incorrectOrUnanswered.splice(i, 1);
      i--;
    }
  }
};

Quiz.prototype.getIndex = function (arr, sName) {
  for (var i=0; i < arr.length; i++) {
    if (arr[i].name === sName)
      return i;
  }

  return -1;
};

Quiz.prototype.markAnswered = function (sName, bCorrect) {
  if (bCorrect) {
    this.numRight++;
  } else {
    this.numWrong++;

    var rawIndex = this.getIndex(this.rawteammates, sName);

    // otherwise, stick it back in the current slice
    this.currentSlice.push(this.rawteammates[rawIndex]);
  }
};

Quiz.prototype.randomPop = function (arr) {
  var r = Math.floor(Math.random() * arr.length);
  return arr.splice(r, 1)[0];
};

Quiz.prototype.getNext = function () {
  // fill up the current slice
  while (this.currentSlice.length !== Quiz.SLICE_SIZE || this.incorrectOrUnanswered.length === 0) {
    this.currentSlice.push(this.randomPop(this.incorrectOrUnanswered));
  }

  return this.randomPop(this.currentSlice);
};

_.bindAll(Quiz);