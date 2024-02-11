-- CreateTable
CREATE TABLE "SurveyOption" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,

    CONSTRAINT "SurveyOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SurveyOption" ADD CONSTRAINT "SurveyOption_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
