-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'english',
    "country" TEXT NOT NULL DEFAULT 'UK',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "departureCity" TEXT,
    "destinationCity" TEXT,
    "departureDate" TEXT,
    "returnDate" TEXT,
    "departureCityPromptId" TEXT,
    "userAnswerId" TEXT,
    "departureCityCode" TEXT,
    "destinationCityCode" TEXT,
    "destinationCityPromptId" TEXT,
    "departureDatePromptId" TEXT,
    "returnDatePromptId" TEXT,
    "multicitySearchData" TEXT,
    "bookingMarkdownId" BIGINT,
    "language" TEXT NOT NULL DEFAULT 'english',
    "one_way_search_state" BOOLEAN NOT NULL DEFAULT false,
    "return_search_state" BOOLEAN NOT NULL DEFAULT false,
    "multi_city_search_state" BOOLEAN NOT NULL DEFAULT false,
    "chat_id" BIGINT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchResults" (
    "id" SERIAL NOT NULL,
    "searchResults" TEXT NOT NULL,
    "chat_id" BIGINT NOT NULL,

    CONSTRAINT "SearchResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingSession" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "LastName" TEXT,
    "email" TEXT,
    "searchResultId" TEXT,
    "firstNamePromptId" TEXT,
    "userAnswerId" TEXT,
    "lastNamePromptId" TEXT,
    "emailPromptId" TEXT,
    "bookingDetailMarkdownId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'english',
    "chat_id" BIGINT NOT NULL,

    CONSTRAINT "BookingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_chat_id_key" ON "User"("chat_id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "User"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchResults" ADD CONSTRAINT "SearchResults_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "User"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSession" ADD CONSTRAINT "BookingSession_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "User"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;
