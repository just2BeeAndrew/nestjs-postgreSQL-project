import {AnswerStatus} from "../entity/answer.entity";

export class CreateAnswerDomainDto {
    questionId: string;
    playerAnswer: string;
    answerStatus: AnswerStatus;
    playerId: string;
}