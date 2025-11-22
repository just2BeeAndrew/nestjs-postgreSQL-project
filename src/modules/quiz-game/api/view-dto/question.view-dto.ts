export class QuestionRaw {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string | null;

  static mapToView(question: QuestionRaw): QuestionViewDto {
    const dto = new QuestionViewDto();

    dto.id = question.id;
    dto.body = question.body;
    dto.correctAnswers = question.correctAnswers;
    dto.published = question.published;
    dto.createdAt = question.createdAt.toISOString();
    dto.updatedAt =
      question.createdAt.getTime() === question.updatedAt.getTime()
        ? null
        : question.updatedAt.toISOString();

    return dto;
  }
}
