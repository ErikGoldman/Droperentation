var Quiz = function (dataFrame) {
	this.loadAll(dataFrame);
};

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
	
	this.teammates = this.rawteammates.slice();
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

Quiz.prototype.getNext = function () {
	var r = Math.floor(Math.random() * this.teammates.length);	
	return this.teammates.splice(r, 1)[0];	
};

_.bindAll(Quiz);