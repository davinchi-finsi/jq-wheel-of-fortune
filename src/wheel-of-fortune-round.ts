/**
 * @module jqWheelOfFortune
 *//** */
/**
 * Represents a round in the game
 */
export class WheelOfFortuneRound{
    /**
     * Id of the answer
     */
    answerId:any;
    /**
     * Id of the category
     */
    categoryId:any;
    /**
     * Id of the question asked
     */
    questionId:string;
    /**
     * true if the answer is correct
     */
    success:boolean;
}