/**
 *  @module jqWheelOfFortune
 *//** */
import {WheelOfFortuneCategory} from "./wheel-of-fortune-category";
import {WheelOfFortuneQuestion} from "./wheel-of-fortune-question";
import {WheelOfFortuneRuntimeGame} from "./wheel-of-fortune-runtime-game";

export class WheelOfFortuneRuntime{
    /**
     * JQuery nodes for current available answers
     */
    $currentAnswers:JQuery;
    /**
     * Catalog
     */
    catalog:WheelOfFortuneCategory[];
    /**
     * Category of the current question
     */
    currentCategory:WheelOfFortuneCategory;
    /**
     * Current question
     */
    currentQuestion:WheelOfFortuneQuestion;
    /**
     * Game state
     */
    game:WheelOfFortuneRuntimeGame;
    /**
     * Historic of answers
     */
    historic:{[key:string]:{$container:JQuery;$registryContainer:JQuery}};
    /**
     * Max number of rounds
     */
    maxRounds:number;
    /**
     * Max score
     */
    maxScore:number;
    /**
     * Total number of categories
     */
    numOfCategories:number;
    /**
     * Total number of questions
     */
    numOfQuestions:number;
}