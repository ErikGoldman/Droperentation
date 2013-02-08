var Quiz = function (dataFrame) {
	this.loadAll(dataFrame);
};

Quiz.prototype = new Object();

Quiz.prototype.loadAll = function (dataFrame) {
	this.teammates = $(dataFrame[0].contentDocument.body).find(".team-member");
};

Quiz.prototype.getNext = function () {
	var r = Math.floor(Math.random() * this.teammates.length);
	
	var teammate = $(this.teammates[r]);
	this.teammates.splice(r, 1);
	
	var out = {img: teammate.find("img").attr("src"),
			   name: teammate.find(".name").text(),
			   title: teammate.find(".title").text(),
			   };
	
	return out;
};