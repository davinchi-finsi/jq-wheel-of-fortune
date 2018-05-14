/**
 * @module jqWheelOfFortune
 *
 *//** */
import {WheelOfFortuneQuestionAnswer} from "./wheel-of-fortune-question-answer";

/**
 * Question of a category
 */
export class WheelOfFortuneQuestion{
    /**
     * Id of the question
     */
    id:any;
    /**
     * Content to show
     */
    content:string;
    /**
     * Available answers for the question
     */
    answers:WheelOfFortuneQuestionAnswer[];
}