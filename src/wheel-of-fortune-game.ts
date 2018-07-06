import {Winwheel} from "./Winwheel";
/**
 * @module jqWheelOfFortune
 *//** */
import  {WheelOfFortuneOptions} from "./wheel-of-fortune-options";
import {WheelOfFortuneEvents} from "./wheel-of-fortune-events";
import {WheelOfFortuneRuntime} from "./wheel-of-fortune-runtime";
export class WheelOfFortuneGame{
    /**
     * Root element of the plugin
     */
    protected element: JQuery;
    /**
     * Current options
     */
    protected options: WheelOfFortuneOptions;
    protected $wheel:JQuery;
    protected $spin:JQuery;
    protected $score:JQuery;
    protected $objectivesBar:JQuery;
    protected $lives:JQuery;
    protected $historic:JQuery;
    protected $dialog:JQuery;
    protected $dialogQuestion:JQuery;
    protected $dialogAnswers:JQuery;
    protected $checkAnswer:JQuery;
    protected winWheelInstance:any;
    protected runtime:WheelOfFortuneRuntime;
    protected answering:boolean;
    protected disabled:boolean;
    protected spinDisabled:boolean;
    /**
     * @constructor
     * @private
     */
    _create() {
        this.element.addClass(this.options.classes.root);
        this._getElements();
        this.$objectivesBar.progressbar();
        this._initDialog();
        this._disableDialog();
        this._createWheel();
        this._initWheel();
        this._assignEvents();
    }
    protected _getCreateOptions(){
        let options:WheelOfFortuneOptions =  {
            namespace:"jq-wheeloffortune",
            rounds:-1,//number of rounds (questions) to perform. -1 to no limit
            pointsForSuccess:1,//points to add when the answer is correct
            pointsForFail:0,//points to substract when the answer is incorrect
            cutOfMarkPoints:0,//cut of mark by number of points. 0 to use the 100%
            lives:-1,//max number of fails. -1 to no limit
            autoCloseQuestionDialogIn:3000,
            classes: {//css classes for elements
                root:"wof",
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
                closeOnEscape:false,
                show: {
                    effect: "blind",
                    duration: 400
                },
                hide: {
                    effect: "blind",
                    duration: 400
                }
            },
            selectors:{
                queryWheel:"[data-wof-wheel]",
                querySpin:"[data-wof-spin]",
                queryScore:"[data-wof-score]",
                queryObjectiveBar:"[data-wof-objective-bar]",
                queryLives:"[data-wof-lives]",
                queryHistoric:"[data-wof-historic]",
                queryQuestionsDialog:"[data-wof-dialog]",
                queryQuestionsDialogQuestion:"[data-wof-question]",
                queryQuestionsDialogAnswers:"[data-wof-answers]",
                queryCheckAnswer:"[data-wof-check-answer]"
            },
            wheel:{
                textFontSize:14,
                numSegments:6,
                animation: {
                    duration: 3,
                    spins: 6
                }
            }
        };
        return options;
    }
    _getElements(){
        this.$wheel = this.element.find(this.options.selectors.queryWheel);
        this.$spin = this.element.find(this.options.selectors.querySpin);
        this.$score = this.element.find(this.options.selectors.queryScore);
        this.$objectivesBar = this.element.find(this.options.selectors.queryObjectiveBar);
        this.$lives = this.element.find(this.options.selectors.queryLives);
        this.$historic = this.element.find(this.options.selectors.queryHistoric);
        this.$dialog = this.element.find(this.options.selectors.queryQuestionsDialog);
        this.$dialogQuestion = this.$dialog.find(this.options.selectors.queryQuestionsDialogQuestion);
        this.$dialogQuestion.addClass(this.options.classes.question);
        this.$dialogAnswers = this.$dialog.find(this.options.selectors.queryQuestionsDialogAnswers);
        this.$checkAnswer=this.$dialog.find(this.options.selectors.queryCheckAnswer);
        //create dialog
    }
    _initDialog(){
        let dialogOptions = $.extend(true,{},this.options.dialog);
        dialogOptions.autoOpen = false;
        if(dialogOptions.position && dialogOptions.position.of == undefined){
            dialogOptions.position.of=this.element;
        }
        this.$dialog.dialog(dialogOptions);
    }
    _disableDialog(){
        this.$dialog.dialog("disable");
    }
    _enableDialog(){
        this.$dialog.dialog("enable");
    }
    _createWheel(){
        this.$wheel.uniqueId();
    }
    _updateCanvasDimensions(){
        //@ts-ignore
        this.$wheel.get(0).height =  parseFloat(this.$wheel.css("height"));
        //@ts-ignore
        this.$wheel.get(0).width = parseFloat(this.$wheel.css("width"));
        this.winWheelInstance.draw();
    }
    _createHistoric(){
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
    }
    _createLives(){
        let numLives = this.options.lives;
        let lives = ``;
        if(numLives != -1){
            for(;numLives>0;numLives--){
                lives+=`<i class="${this.options.classes.live}"></i>`
            }
        }
        this.$lives.empty().append(lives);
    }
    _resetWheel(){
        const categories = this.runtime.catalog;
        this.winWheelInstance.segments = [];
        this.winWheelInstance.numSegments = 0;
        for(let category of categories) {
            this.winWheelInstance.addSegment($.extend({
                'text': category.title,
                'fillStyle': category.color,
                'categoryId':category.id,
                'textFillStyle':category.titleColor
            },category.wheel||{}), 1);
        }
        this.winWheelInstance.draw();
    }
    _initWheel(){
        let params = $.extend(true,this.options.wheel,{
            'canvasId':this.$wheel.attr("id"),
            'animation' :{
                'type'     : 'spinToStop',
                'callbackFinished' : this._onSpinWheelEnd.bind(this),
                'yoyo':true
            }
        });
        //@ts-ignore
        this.winWheelInstance= new Winwheel(params);
        //this._updateCanvasDimensions();
    }

    _assignEvents(){
        this.$spin.on("click",{instance:this},this._onSpinBtnClick);
        this.$checkAnswer.on("click",{instance:this},this._onCheckAnswersBtnClick);
        this.$dialog.on("dialogclose",{instance:this},this._onQuestionDialogClosed);
    }
    _onSpinBtnClick(e){
        //spin
        e.data.instance.spinWheel();
    }
    _onCheckAnswersBtnClick(e){
        e.data.instance._checkAnswer();
    }
    _onSpinWheelEnd(){
        //chose category
        let wheelSection = this.winWheelInstance.getIndicatedSegment();
        this.element.trigger(WheelOfFortuneEvents.onWheelSpinEnd);
        this._chooseCategory(wheelSection.categoryId);
    }
    _resetSpinWheel(){
        this.winWheelInstance.rotationAngle=0;
        this.winWheelInstance.draw();
    }
    _onQuestionDialogClosed(e){
        const instance = e.data.instance;
        instance._onRoundEnd();

    }
    _resetQuestionDialog() {
        this.$checkAnswer.prop("disabled",false);
        this.$dialog.removeClass(this.options.classes.answerCorrect+" "+this.options.classes.answerIncorrect);
    }
    _getSelectedAnswerId(){
        return this.$dialog.find(":checked").attr("value");
    }
    _checkAnswer(){
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
            this.element.trigger(WheelOfFortuneEvents.onAnswer,{game:this.runtime.game,round:runtimeRound});
            setTimeout(() => {
                this.$dialog.dialog("close")
            }, this.options.autoCloseQuestionDialogIn);
        }
    }

    _setCategoryToDialog(category){
        this.$dialog.data("uiDialog").uiDialog.attr("data-wof-category",category.id);
    }
    _setTitleToDialog(category,question){
        this.$dialog.dialog("option","title",category.title);
    }
    _setQuestionToDialog(question){
        this.$dialogQuestion.text(question.content);
    }
    _createAnswers(question,answers){
        let items = `<ul class="${this.options.classes.answers}">`,
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
    }
    _disableAnswers($answers){
        $answers.find("input").attr("disabled","disabled");
    }
    _openQuestionDialog(){
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
        this.element.trigger(WheelOfFortuneEvents.onQuestion,this.runtime.game.rounds.slice(-1)[0]);
    }
    _removeCategoryFromWheel(category){
        const segments = this.winWheelInstance.segments;
        const index = segments.findIndex((segment)=>segment && segment.categoryId == category.id);
        if(index != -1){
            this.winWheelInstance.deleteSegment(index);
            this.winWheelInstance.draw();
        }
    }
    _chooseCategory(categoryId){
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
    }
    _updateLives(){
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
    }
    _addResultToHistoric(categoryId,success){
    if(success != undefined) {
        let historic = this.runtime.historic[categoryId];
        if(historic) {
            historic.$registryContainer.append(`<i class="${this.options.classes.historicItem} ${success
                                                                                                 ? this.options.classes.historicItemSuccess
                                                                                                 : this.options.classes.historicItemFail}"></i>`)
        }
    }
}
    _redrawHistoric(){
        this.runtime.historic = this._createHistoric();
        let rounds = this.runtime.game.rounds;
        for(let round of rounds){
            this._addResultToHistoric(round.categoryId,round.success);
        }
    }
    _updatePoints(){
        this.$score.html(<any>this.runtime.game.score);
        if(this.$objectivesBar.length > 0) {
            this.$objectivesBar.progressbar("option","value", (this.runtime.game.score * 100) / this.runtime.maxScore);
        }
    }
    _onRoundEnd(){
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
    }
    _restoreSavedGame(){

    }

    _calcMaxRounds(runtime){
        //if rounds is -1,  the num of rounds will be the number of posibilites
        let rounds = this.options.rounds;
        if(rounds == -1){
            rounds =  runtime.numCategories * runtime.numQuestions;
        }
        return rounds;
    }
    _calcMaxScore(runtime){
        return runtime.maxRounds * this.options.pointsForSuccess;
    }
    _getAvailableCatalog(game){
        let categories = this.options.catalog,
            numOfCategories = categories.length,
            availableCatalog,
            numOfQuestions = 0;
        if(!game) {
            for (let categoryIndex = 0, categoriesLength = categories.length; categoryIndex < categoriesLength; categoryIndex++) {
                let currentCategory = categories[categoryIndex],
                    questions = currentCategory.questions;
                numOfQuestions += questions.length;
            }
            availableCatalog = $.extend(true,[],categories);
        }else{
            let rounds = game.rounds;
            availableCatalog = $.extend(true,[],categories);
            for (let roundIndex = 0, roundsLength = rounds.length; roundIndex < roundsLength; roundIndex++) {
                let currentRound = rounds[roundIndex];
                let category = availableCatalog.find((category)=>category.id == currentRound.categoryId);
                if(category){
                    let question = category.questions.find((question)=>question.id == currentRound.questionId);
                    if(question){
                        let questionIndex = category.questions.indexOf(question);
                        category.questions.splice(questionIndex,1);
                        if(category.questions.length == 0){
                            availableCatalog.splice(availableCatalog.indexOf(category),1);
                        }
                    }
                }
            }
        }

        return{
            numOfCategories:numOfCategories,
            numOfQuestions:numOfQuestions,
            catalog:availableCatalog
        };
    }
    _nextRound(){
        //if options.lives != 0 && lives == 0
        if(this.options.lives != -1 && this.runtime.game.lives == 0){
            this.element.removeClass(this.options.classes.running);
            this.element.addClass(this.options.classes.fail);
            this.element.trigger(WheelOfFortuneEvents.onEnd,{success:false,game:this.runtime.game,maxScore:this.runtime.maxScore});
        }else if(this.options.rounds !=-1 && this.runtime.game.currentRound == this.options.rounds){
            //end
            this.element.removeClass(this.options.classes.running);
            if(this.runtime.game.score >= this.options.cutOfMarkPoints){
                this.element.addClass(this.options.classes.success);
                this.element.trigger(WheelOfFortuneEvents.onEnd,{success:true,game:this.runtime.game,maxScore:this.runtime.maxScore});
            }else{
                this.element.addClass(this.options.classes.fail);
                this.element.trigger(WheelOfFortuneEvents.onEnd,{success:false,game:this.runtime.game,maxScore:this.runtime.maxScore});
            }
        }else{
            this._resetSpinWheel();
            this.spinDisabled = false;
            this.$spin.prop("disabled",false);
        }
    }
    spinWheel(){
        if(this.disabled != true && this.answering != true && this.spinDisabled != true){
            this.spinDisabled = true;
            this.$spin.prop("disabled",true);
            this.winWheelInstance.startAnimation();
            this.element.trigger(WheelOfFortuneEvents.onWheelSpin);
        }
    }
    newGame(data){
        this.element.removeClass(this.options.classes.fail);
        this.element.removeClass(this.options.classes.success);
        this.element.addClass(this.options.classes.running);
        let {numOfQuestions,numOfCategories,catalog} = this._getAvailableCatalog(data);
        this.runtime = <any>{
            numOfQuestions:numOfQuestions,
            numOfCategories:numOfCategories,
            catalog:catalog,
            game: data || {
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
    }
    enable(){

    }
    disable(){

    }
    refresh(){

    }
    destroy(){

    }
}