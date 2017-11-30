/*! jqWheelOfFortune | (c) Davinchi | https://gitlab.com/davinchi/games/jq-wheel-of-fortune */
( function (factory) {
    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define([
            "jquery",
            "../widget"
        ], factory);
    } else {

        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.widget(
        "ui.jqWheelOfFortune", {
            NAMESPACE: "jqWheelOfFortune",
            QUERY_WHEEL:"[data-wof-wheel]",
            QUERY_SPIN:"[data-wof-spin]",
            QUERY_SCORE:"[data-wof-score]",
            QUERY_OBJECTIVE_BAR:"[data-wof-objective-bar]",
            QUERY_LIVES:"[data-wof-lives]",
            QUERY_HISTORIC:"[data-wof-historic]",
            QUERY_QUESTIONS_DIALOG:"[data-wof-dialog]",
            QUERY_QUESTIONS_DIALOG_QUESTION:"[data-wof-question]",
            QUERY_QUESTIONS_DIALOG_ANSWERS:"[data-wof-answers]",
            QUERY_CHECK_ANSWER:"[data-wof-check-answer]",
            options: {
                rounds:-1,//number of rounds (questions) to perform. -1 to no limit
                pointsForSuccess:1,//points to add when the answer is correct
                pointsForFail:0,//points to substract when the answer is incorrect
                cutOfMarkPoints:0,//cut of mark by number of points. 0 to use the 100%
                lives:-1,//max number of fails. -1 to no limit
                autoCloseQuestionDialogIn:3000,
                classes: {//css classes for elements
                    wof:"wof",
                    answers:"wof__answers",
                    answer:"wof__answers__answer",
                    answerCorrect:"wof--correct",
                    answerIncorrect:"wof--incorrect",
                    running:"wof--running",
                    success:"wof--success",
                    fail:"wof--fail",
                    live:"wof__lives__live",
                    lives:"wof__lives",
                    lostLive:"wof__lives__live--lost",
                    historicCategory:"wof__historic__category",
                    historicCategoryTitle:"wof__historic__category__title",
                    historicAnswersContainer:"wof__historic__category__answers",
                    historicItem:"wof__historic__category__answer",
                    historicItemSuccess:"wof__historic__category__answer--success",
                    historicItemFail:"wof__historic__category__answer--fail",
                    question:"wof__question",
                },
                catalog:[],
                dialog:{
                    classes:{
                        "ui-dialog":"wof-dialog"
                    },
                    draggable:false,
                    resizable:false,
                    position:{my:"center",at:"center"},
                    closeOnEscape:false
                },
                wheel:{
                    textSize:14,
                    numSegments:6,
                    animation: {
                        duration: 1,
                        spins: 1
                    }
                }
            },
            /**
             * @constructor
             * @private
             */
            _create: function () {
                this.element.addClass(this.options.classes.wof);
                this._getElements();
                this.$objectivesBar.progressbar();
                this._initDialog();
                this._disableDialog();
                this._createWheel();
                this._initWheel();
                this._assignEvents();
            },
            _getElements:function(){
                this.$wheel = this.element.find(this.QUERY_WHEEL);
                this.$spin = this.element.find(this.QUERY_SPIN);
                this.$score = this.element.find(this.QUERY_SCORE);
                this.$objectivesBar = this.element.find(this.QUERY_OBJECTIVE_BAR);
                this.$lives = this.element.find(this.QUERY_LIVES);
                this.$historic = this.element.find(this.QUERY_HISTORIC);
                this.$dialog = this.element.find(this.QUERY_QUESTIONS_DIALOG);
                this.$dialogQuestion = this.$dialog.find(this.QUERY_QUESTIONS_DIALOG_QUESTION);
                this.$dialogQuestion.addClass(this.options.classes.question);
                this.$dialogAnswers = this.$dialog.find(this.QUERY_QUESTIONS_DIALOG_ANSWERS);
                this.$checkAnswer=this.$dialog.find(this.QUERY_CHECK_ANSWER);
                //create dialog
            },
            _initDialog:function(){
                let dialogOptions = $.extend(true,{},this.options.dialog);
                dialogOptions.autoOpen = false;
                if(dialogOptions.position && dialogOptions.position.of == undefined){
                    dialogOptions.position.of=this.element;
                }
                this.$dialog.dialog(dialogOptions);
            },
            _disableDialog:function(){
                this.$dialog.dialog("disable");
            },
            _enableDialog:function(){
                this.$dialog.dialog("enable");
            },
            _createWheel:function(){
                this.$wheel.uniqueId();
            },
            _updateCanvasDimensions:function(){
                this.$wheel.get(0).height =  parseFloat(this.$wheel.css("height"));
                this.$wheel.get(0).width = parseFloat(this.$wheel.css("width"));
                this.winWheelInstance.draw();
            },
            _createHistoric:function(){
                let historic = {};
                if(this.$historic.length > 0) {
                    let categories = this.runtime.catalog;
                    this.$historic.empty();
                    for (let category of categories) {
                        let $container = $(`<div class="${this.options.classes.historicCategory}" data-wof-historic-item="${category.id}"><p class="${this.options.classes.historicCategoryTitle}">${category.title}</p></div>`);
                        let $registryContainer = $(`<div class="${this.options.classes.historicAnswersContainer}"></div>`);
                        historic[category.id] = {
                            $container: $container,
                            $registryContainer: $registryContainer
                        };
                        $container.append($registryContainer);
                        this.$historic.append($container);
                    }
                }
                return historic;
            },
            _createLives:function(){
                let numLives = this.options.lives;
                let lives = ``;
                if(numLives != -1){
                    for(;numLives>0;numLives--){
                        lives+=`<i class="${this.options.classes.live}"></i>`
                    }
                }
                this.$lives.empty().append(lives);
            },
            _resetWheel:function(){
                const categories = this.runtime.catalog;
                this.winWheelInstance.segments = [];
                this.winWheelInstance.numSegments = 0;
                for(let category of categories) {
                    this.winWheelInstance.addSegment({
                        'text': category.title,
                        'fillStyle': category.color,
                        'categoryId':category.id
                    }, 1);
                }
                this.winWheelInstance.draw();
            },
            _initWheel:function(){
                let params = $.extend(true,this.options.wheel,{
                    'canvasId':this.$wheel.attr("id"),
                    'animation' :{
                        'type'     : 'spinToStop',
                        'callbackFinished' : this._onSpinWheelEnd.bind(this),
                        'yoyo':true
                    }
                });
                this.winWheelInstance= new Winwheel(params);
                //this._updateCanvasDimensions();
            },

            _assignEvents:function(){
                this.$spin.on("click",{instance:this},this._onSpinBtnClick);
                this.$checkAnswer.on("click",{instance:this},this._onCheckAnswersBtnClick);
                this.$dialog.on("dialogclose",{instance:this},this._onQuestionDialogClosed);
            },
            _onSpinBtnClick:function(e){
                //spin
                e.data.instance.spinWheel();
            },
            _onCheckAnswersBtnClick:function(e){
                e.data.instance._checkAnswer();
            },
            _onSpinWheelEnd:function(){
                //chose category
                let wheelSection = this.winWheelInstance.getIndicatedSegment();
                this._chooseCategory(wheelSection.categoryId);
            },
            _resetSpinWheel:function(){
                this.winWheelInstance.rotationAngle=0;
                this.winWheelInstance.draw();
            },
            _onQuestionDialogClosed:function(e){
                const instance = e.data.instance;
                instance._onRoundEnd();

            },
            _resetQuestionDialog:function() {
                this.$checkAnswer.prop("disabled",false);
                this.$dialog.removeClass(this.options.classes.answerCorrect+" "+this.options.classes.answerIncorrect);
            },
            _getSelectedAnswerId:function(){
                return this.$dialog.find(":checked").attr("value");
            },
            _checkAnswer:function(){
                const selectedAnswerId = this._getSelectedAnswerId();
                if(selectedAnswerId != undefined){
                    this.$checkAnswer.prop("disabled", true);
                    this._disableAnswers(this.runtime.$currentAnswers);
                    //currentAnswer = answer
                    const selectedAnswerId = this._getSelectedAnswerId();
                    const selectedAnswer = this.runtime.currentQuestion.answers.find((answer) => answer.id == selectedAnswerId);
                    let runtimeRound = this.runtime.game.rounds.slice(-1)[0];
                    //update answer in runtime
                    //update points in runtime
                    runtimeRound.answerId = selectedAnswer.id;
                    runtimeRound.success = selectedAnswer.isCorrect;
                    //if success
                    if (selectedAnswer.isCorrect) {
                        //draw success
                        this.$dialog.addClass(this.options.classes.answerCorrect);
                        //add points
                        this.runtime.game.score += this.options.pointsForSuccess;
                    } else {
                        //draw fail
                        this.$dialog.addClass(this.options.classes.answerIncorrect);
                        //lives --
                        if (this.runtime.game.lives > 0) {
                            //update lives in runtime
                            this.runtime.game.lives--;
                        }
                        //substract points
                        this.runtime.game.score -= this.options.pointsForFail;
                    }
                    setTimeout(() => {
                        this.$dialog.dialog("close")
                    }, this.options.autoCloseQuestionDialogIn);
                }
            },

            _setCategoryToDialog:function(category){
                this.$dialog.data("uiDialog").uiDialog.attr("data-wof-category",category.id);
            },
            _setTitleToDialog:function(category,question){
                this.$dialog.dialog("option","title",category.title);
            },
            _setQuestionToDialog:function(question){
                this.$dialogQuestion.text(question.content);
            },
            _createAnswers:function(question,answers){
                let items = `<ul class="${this.options.classes.answers}">`
                    answerClass = this.options.classes.answer;
                for(let answer of answers){
                    items+=
                    `<li><label class="${answerClass}">
                        <input type="radio" name="${question.id}" value="${answer.id}">
                        <span>${answer.content}</span>
                     </label></li>`;
                }
                items+=`</ul>`;
                return $(items);
            },
            _disableAnswers:function($answers){
                $answers.find("input").attr("disabled","disabled");
            },
            _openQuestionDialog:function(){
                this.answering = true;
                this._resetQuestionDialog();
                //set category id to data
                const category = this.runtime.currentCategory,
                    question = this.runtime.currentQuestion;
                this._setCategoryToDialog(category);
                //set title
                this._setTitleToDialog(category,question);
                //set content
                this._setQuestionToDialog(question);
                //set options
                const $answers = this._createAnswers(question,question.answers);
                this.runtime.$currentAnswers = $answers;
                this.$dialogAnswers.empty().append($answers);
                this.$dialog.dialog("open");
            },
            _removeCategoryFromWheel:function(category){
                const segments = this.winWheelInstance.segments;
                const index = segments.find((segment)=>{segment && segment.categoryId == category.id});
                if(index != -1){
                    this.winWheelInstance.deleteSegment(index);
                    this.winWheelInstance.draw();
                }
            },
            _chooseCategory:function(categoryId){
                let availableCategories = this.runtime.catalog;
                //get category data from runtime
                let selectedCategory = availableCategories.find((item)=>item.id == categoryId);
                this.runtime.currentCategory = selectedCategory;
                //random question from runtime
                let randomQuestionIndex = Math.floor(Math.random() * selectedCategory.questions.length),
                    question = selectedCategory.questions[randomQuestionIndex];
                this.runtime.currentQuestion = question;
                //remove question from available questions
                selectedCategory.questions.splice(randomQuestionIndex,1);
                //if no more questions in category
                if(selectedCategory.questions.length == 0){
                    //remove category from available categories
                    availableCategories.splice(availableCategories.indexOf(selectedCategory),1);
                    //update wheel
                    this._removeCategoryFromWheel(selectedCategory);
                }
                //update round in runtime
                this.runtime.game.currentRound++;
                //add question to runtime
                this.runtime.game.rounds.push({
                    categoryId:selectedCategory.id,
                    questionId:question.id,
                    answerId:null,
                    success:null
                });
                //open question dialog
                this._openQuestionDialog();
            },
            _updateLives:function(){
                if(this.options.lives != -1 && this.$lives.length > 0) {
                    let lostLiveClass = this.options.classes.lostLive,
                        $availableLives = this.$lives.children().not("." + lostLiveClass),
                        availableLives = $availableLives.length;
                    if (this.runtime.game.lives != availableLives){
                        let toUpdate = availableLives-this.runtime.game.lives;
                        for(let liveIndex = -1;toUpdate >0;liveIndex--,toUpdate--){
                            $availableLives.eq(liveIndex).addClass(lostLiveClass);
                        }
                    }
                }
            },
            _addResultToHistoric(categoryId,success){
                if(success != undefined) {
                    let historic = this.runtime.historic[categoryId];
                    if(historic) {
                        historic.$registryContainer.append(`<i class="${this.options.classes.historicItem} ${success
                            ? this.options.classes.historicItemSuccess
                            : this.options.classes.historicItemFail}"></i>`)
                    }
                }
            },
            _redrawHistoric:function(){
                this.runtime.historic = this._createHistoric();
                let rounds = this.runtime.game.rounds;
                for(let round of rounds){
                    this._addResultToHistoric(round.catregoryId,round.success);
                }
            },
            _updatePoints:function(){
                this.$score.html(this.runtime.game.score);
                if(this.$objectivesBar.length > 0) {
                    this.$objectivesBar.progressbar("option","value", (this.runtime.game.score * 100) / this.runtime.maxScore);
                }
            },
            _onRoundEnd:function(){
                //update lives
                this._updateLives();
                //update points
                this._updatePoints();
                //update historic
                let currentRound = this.runtime.game.rounds.slice(-1)[0];
                this._addResultToHistoric(currentRound.categoryId,currentRound.success);
                this.runtime.$currentAnswers = null;
                this.runtime.currentCategory = null;
                this.runtime.currentQuestion = null;
                //nextRound
                this.answering = false;
                this._nextRound();
            },
            _restoreSavedGame:function(){

            },
            
            _calcMaxRounds:function(runtime){
                //if rounds is -1,  the num of rounds will be the number of posibilites
                let rounds = this.options.rounds;
                if(rounds == -1){
                    rounds =  runtime.numCategories * runtime.numQuestions;
                }
                return rounds;
            },
            _calcMaxScore:function(runtime){
                return runtime.maxRounds * this.options.pointsForSuccess;
            },
            _getAvailableCatalog:function(){
                let categories = this.options.catalog,
                    numOfCategories = categories.length,
                    numOfQuestions = 0;
                for (let categoryIndex = 0, categoriesLength = categories.length; categoryIndex < categoriesLength; categoryIndex++) {
                    let currentCategory = categories[categoryIndex],
                        questions = currentCategory.questions;
                    numOfQuestions+=questions.length;
                }
                return{
                    numOfCategories:numOfCategories,
                    numOfQuestions:numOfQuestions,
                    catalog:$.extend(true,[],categories)//duplicate objects to free manipulation
                };
            },
            _nextRound:function(){
                //if options.lives != 0 && lives == 0
                if(this.options.lives != -1 && this.runtime.game.lives == 0){
                    this.element.removeClass(this.options.classes.running);
                    this.element.addClass(this.options.classes.fail);
                }else if(this.options.rounds !=-1 && this.runtime.game.currentRound == this.options.rounds){
                    //end
                    this.element.removeClass(this.options.classes.running);
                    if(this.runtime.game.score >= this.options.cutOfMarkPoints){
                        this.element.addClass(this.options.classes.success);
                    }else{
                        this.element.addClass(this.options.classes.fail);
                    }
                }else{
                    this._resetSpinWheel();
                    this.spinDisabled = false;
                    this.$spin.prop("disabled",false);
                }
            },
            spinWheel:function(){
                if(this.disabled != true && this.answering != true && this.spinDisabled != true){
                    this.spinDisabled = true;
                    this.$spin.prop("disabled",true);
                    this.winWheelInstance.startAnimation();
                }
            },
            newGame:function(){
                this.element.addClass(this.options.classes.running);
                let {numOfQuestions,numOfCategories,catalog} = this._getAvailableCatalog();
                this.runtime = {
                    numOfQuestions:numOfQuestions,
                    numOfCategories:numOfCategories,
                    catalog:catalog,
                    game: {
                        currentRound: 0,
                        lives:this.options.lives,
                        score: 0,
                        rounds: []
                    }
                };
                this.runtime.maxRounds = this._calcMaxRounds(this.runtime);
                this.runtime.maxScore = this._calcMaxScore(this.runtime);
                this._createLives();
                this._redrawHistoric();
                this._resetWheel();
                this._updateLives();
                this._updatePoints();
                this._nextRound();
            },
            generateGameData:function(){

            },
            loadGameData:function(){

            },
            enable:function(){

            },
            disable:function(){

            },
            refresh:function(){

            }
        }
    );
    return $.ui.jqWheelOfFortune;
}) );