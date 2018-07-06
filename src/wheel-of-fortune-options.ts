/**
 * @module jqWheelOfFortune
 *//** */
export interface WheelOfFortuneOptions{
    /**
     * Namespace for events
     * @default jq-wheeloffortune
     */
    namespace?: string;
    /**
     * Disable the widget
     * @default false
     */
    disabled?:boolean;
    /**
     * Css classes to use
     */
    classes?: {//css classes for elements
        /**
         * Root element
         * @default wof
         */
        root?: string;
        /**
         * Class for the disabled state
         * @default `c-cards-quiz--disabled`
         */
        disabled?: string;
        /**
         * @default "wof__answers",
         */
        answers?:string;
        /**
         * @default "wof__answers__answer",
         */
        answer?:string;
        /**
         * @default "wof--correct",
         */
        answerCorrect?:string;
        /**
         * @default "wof--incorrect",
         */
        answerIncorrect?:string;
        /**
         * @default "wof--running",
         */
        running?:string;
        /**
         * @default "wof--success",
         */
        success?:string;
        /**
         * @default "wof--fail",
         */
        fail?:string;
        /**
         * @default "wof__lives__live",
         */
        live?:string;
        /**
         * @default "wof__lives",
         */
        lives?:string;
        /**
         * @default "wof__lives__live--lost",
         */
        lostLive?:string;
        /**
         * @default "wof__historic__category",
         */
        historicCategory?:string;
        /**
         * @default "wof__historic__category__title",
         */
        historicCategoryTitle?:string;
        /**
         * @default "wof__historic__category__answers",
         */
        historicAnswersContainer?:string;
        /**
         * @default "wof__historic__category__answer",
         */
        historicItem?:string;
        /**
         * @default "wof__historic__category__answer--success",
         */
        historicItemSuccess?:string;
        /**
         * @default "wof__historic__category__answer--fail",
         */
        historicItemFail?:string;
        /**
         * @default "wof__question",
         */
        question?:string;
    },
    /**
     * number of rounds (questions) to perform. -1 to no limit
     * @default -1
     */
    rounds?:number,
    /**
     * points to add when the answer is correct
     * @default 1
     */
    pointsForSuccess?:number,
    /**
     * points to substract when the answer is incorrect
     * @default 0
     */
    pointsForFail?:number,
    /**
     * cut of mark by number of points. 0 to use the 100%
     * @default 0
     */
    cutOfMarkPoints?:number,
    /**
     * max number of fails. -1 to no limit
     * @default -1
     */
    lives?:number,
    /**
     * Delay to close dialog. In millis
     * @default 3000
     */
    autoCloseQuestionDialogIn?:number,
    /**
     * Catalog
     */
    catalog:any,
    /**
     * Options for jquery dialog.
     * For more info visit https://api.jqueryui.com/dialog/
     * @default
     * ```json
     * {
     *      classes:{
     *          "ui-dialog":"wof-dialog"
     *      },
     *      draggable:false,
     *      resizable:false,
     *      position:{my:"center",at:"center"},
     *      closeOnEscape:false,
     *      show: {
     *          effect: "blind",
     *          duration: 400
     *      },
     *      hide: {
     *          effect: "blind",
     *          duration: 400
     *      }
     *}
     * ```
     */
    dialog?:any,
    /**
     * Options for winwheel.
     * For more info visit http://dougtesting.net/winwheel/docs
     * @default
     * ```json
     *  {
     *      textFontSize:14,
     *      numSegments:6,
     *      animation: {
     *          duration: 3,
     *          spins: 6
     *      }
     *  }
     * ```
     */
    wheel?:any;
    /**
     * Queries to apply to get the different elements
     */
    selectors?:{
        /**
         * Canvas element in which the wheel will be drawn
         * @default `[data-wof-wheel]`
         */
        queryWheel?:string
        /**
         * Element that will make the wheel spin when clicked
         * @default `[data-wof-spin]`
         */
        querySpin?:string;
        /**
         * Element in which the score will be drawn
         * @default `[data-wof-score]`
         */
        queryScore?:string;
        /**
         * Progress bar
         * @default `[data-wof-objective-bar]`
         */
        queryObjectiveBar?:string;
        /**
         * Element in which the lives will be drawn
         * @default `[data-wof-lives]`
         */
        queryLives?:string;
        /**
         * Element in which the categories will be drawn
         * @default `[data-wof-historic]`
         */
        queryHistoric?:string;
        /**
         * Element which will be used to ask the questions. Will be initialized has jquery ui dialog
         * @default `[data-wof-dialog]`
         */
        queryQuestionsDialog?:string;
        /**
         * Element in which the question will be drawn
         * @default `[data-wof-question]`
         */
        queryQuestionsDialogQuestion?:string
        /**
         * Element in which the available answers for the question will be drawn
         * @default `[data-wof-answers]`
         */
        queryQuestionsDialogAnswers?:string;
        /**
         * Element that will trigger the checking of the answer
         * @default `[data-wof-check-answer]`
         */
        queryCheckAnswer?:string;
    }
}