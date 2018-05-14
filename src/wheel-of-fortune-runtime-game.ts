/**
 * @module jqWheelOfFortune
 *
 *//** */
import {WheelOfFortuneRound} from "./wheel-of-fortune-round";

/**
 * Current state of the game
 */
export class WheelOfFortuneRuntimeGame{
    /**
     * The number of the current round, starting from 0
     */
    currentRound:number;
    /**
     * Current lives
     */
    lives:number;
    /**
     * Rounds played
     */
    rounds:WheelOfFortuneRound[];
    /**
     * Current score
     */
    score:number;
}