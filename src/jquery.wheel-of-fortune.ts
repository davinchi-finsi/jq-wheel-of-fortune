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
            QUERY_RUNTIME:"[data-wof-runtime]",
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
                    answers:"wof__answers",
                    answer:"wof__answers__answer",
                    answerCorrect:"wof--correct",
                    answerIncorrect:"wof--incorrect",
                    live:"wof__lives__live",
                    lives:"wof__lives",
                    lostLive:"wof__lives__live--lost"
                },
                catalog:[],
                lang:{
                    "es":{
                        spin:"Girar ruleta",
                        answer:"Responder",
                        answerSuccess:"¡Correcto!",
                        answerFail:"¡Has fallado!"
                    }
                },
                dialog:{
                    draggable:false,
                    resizable:false,
                    position:{my:"left center",at:"left center"},
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
                this.$runtime = this.element.find(this.QUERY_RUNTIME);
                this.$dialog = this.element.find(this.QUERY_QUESTIONS_DIALOG);
                this.$dialogQuestion = this.$dialog.find(this.QUERY_QUESTIONS_DIALOG_QUESTION);
                this.$dialogAnswers = this.$dialog.find(this.QUERY_QUESTIONS_DIALOG_ANSWERS);
                this.$checkAnswer=this.$dialog.find(this.QUERY_CHECK_ANSWER);
                //create dialog
            },
            _initDialog:function(){
                let dialogOptions = $.extend(true,{},this.options.dialog);
                dialogOptions.autoOpen = false;
                this.$dialog.dialog(dialogOptions);
            },
            _disableDialog:function(){
                this.$dialog.dialog("disable");
            },
            _enableDialog:function(){
                this.$dialog.dialog("enable");
            },
            _createWheel:function(){
                this.$wheel.empty();
                this.$wheelCanvas = $("<canvas>");
                this.$wheel.append(this.$wheelCanvas);
                this.$wheelCanvas.uniqueId();
                this.$wheel.uniqueId();
            },
            _createLives:function(){
                let numLives = this.options.lives;
                let lives = ``;
                if(numLives != -1){
                    for(;numLives>0;numLives--){
                        lives+=`<i class="${this.options.classes.live}"></i>`
                    }
                }
                return lives;
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
                    'canvasId':this.$wheelCanvas.attr("id"),
                    'animation' :{
                        'type'     : 'spinToStop',
                        'callbackFinished' : this._onSpinWheelEnd.bind(this),
                        'yoyo':true
                    }
                });
                this.winWheelInstance= new Winwheel(params);
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
            _onQuestionDialogClosed:function(e){
                const instance = e.data.instance;
                instance._onRoundEnd();

            },
            _resetQuestionDialog:function() {
                this.$checkAnswer.prop("disabled",false);
            },
            _getSelectedAnswerId:function(){
                return this.$dialog.find(":checked").attr("value");
            },
            _checkAnswer:function(){
                this.$checkAnswer.prop("disabled",true);
                this._disableAnswers(this.runtime.$currentAnswers);
                //currentAnswer = answer
                const selectedAnswerId = this._getSelectedAnswerId(),
                    selectedAnswer = this.runtime.currentQuestion.answers.find((answer)=>answer.id == selectedAnswerId);
                let runtimeRound = this.runtime.game.rounds[this.runtime.game.rounds.length-1];
                //update answer in runtime
                //update points in runtime
                runtimeRound.answerId = selectedAnswer.id;
                runtimeRound.success = selectedAnswer.isCorrect;
                //if success
                if(selectedAnswer.isCorrect){
                    //draw success
                    this.$dialog.addClass(this.options.classes.answerCorrect);
                    //add points
                    this.runtime.game.score+=this.options.pointsForSuccess;
                }else{
                    //draw fail
                    this.$dialog.addClass(this.options.classes.answerIncorrect);
                    //lives --
                    if(this.runtime.game.lives >0) {
                        //update lives in runtime
                        this.runtime.game.lives--;
                    }
                    //substract points
                    this.runtime.game.score-=this.options.pointsForFail;
                }
                setTimeout(()=>{this.$dialog.dialog("close")},this.options.autoCloseQuestionDialogIn);
            },

            _setCategoryToDialog:function(category){
                this.$dialog.data("uiDialog").uiDialog.attr("data-wof-category",category);
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
                        <span>${answer.content}</span>
                        <input type="radio" name="${question.id}" value="${answer.id}">
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
                const index = segments.find((segment)=>segment.categoryId == category.id);
                if(index != -1){
                    this.winWheelInstance.delete(index);
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
            _updateRuntime:function(){

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
                //update history
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
                    //_game over
                }else if(this.options.rounds !=-1 && this.runtime.game.rounds == this.options.rounds){
                    //end
                    if(this.runtime.game.score >= this.options.cuttOfMarkPoints){
                        //win
                    }else{
                        //game over
                    }
                }else{
                    this.spinDisabled = false;
                }
            },
            spinWheel:function(){
                if(this.disabled != true && this.answering != true && this.spinDisabled != true){
                    this.spinDisabled = true;
                    this.winWheelInstance.startAnimation();
                }
            },
            newGame:function(){
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
                this.$lives.empty().append(this._createLives());
                this._resetWheel();
                this._updateLives();
                this._updateRuntime();
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