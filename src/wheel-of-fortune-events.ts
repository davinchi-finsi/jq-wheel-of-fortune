/**
 * @module jqWheelOfFortune
 *//** */
import {WheelOfFortuneRuntimeGame} from "./wheel-of-fortune-runtime-game";

/**
 * Data for end event
 * @example ```javascript
 */
export interface WheelOfFortuneOnEndEvent{
    /**
     * The player winds
     */
    success:false,
    /**
     * Game data
     */
    game:WheelOfFortuneRuntimeGame;
    /**
     * Max score
     */
    maxScore:number;
}
/**
 * Available events
 */
export enum WheelOfFortuneEvents{
    /**
     * Triggered when the wheel starts to spin
     * @example ```
     * $("someSelector").on("wof:spin",(e)=>{console.log(e)});
     * ```
     */
    onWheelSpin = "wof:spin",
    /**
     * Triggered when the wheel spin ends
     * @see [[CardsQuizQuestionChangeEvent]]
     * @example ```
     * $("someSelector").on("cardsQuiz:questionChange",(e,data)=>{console.log(data});
     * ```
     */
    onWheelSpinEnd = "wof:spin-end",
    /**
     * Triggered when a question is asked
     * @type {string}
     * The callback receives the round
     * @example
     * ```typescript
     * $("someSelector").on("wof:question",(e,round)=>{console.log(round});
     * ```
     */
    onQuestion = "wof:question",
    /**
     * Triggered when a question is answered
     * @type {string}
     * The callback receives the round
     * @example
     * ```typescript
     * $("someSelector").on("wof:answer",(e,round)=>{console.log(round});
     * ```
     */
    onAnswer = "wof:answer",
    /**
     * Triggered when the quiz ends
     * @see [[WheelOfFortuneOnEndEvent]]
     * @example ```
     * $("someSelector").on("wof:end",(e,data)=>{
     *      console.log(data.game.score);
     * });
     * ```
     */
    onEnd="wof:end"
}