/**
 * @module jqWheelOfFortune
 *//** */
import {WheelOfFortuneQuestion} from "./wheel-of-fortune-question";

/**
 * A category
 */
export class WheelOfFortuneCategory{
    /**
     * Id of the category
     */
    id:any;
    /**
     * Color to draw in the wheel
     */
    color:string;
    /**
     * Color for the title of the category in the wheel
     */
    titleColor:string;
    /**
     * Questions for the category
     */
    questions:WheelOfFortuneQuestion[];
    /**
     * Title of the category
     */
    title:string;
    /**
     * Options for winwheel
     */
    wheel?:any;
}