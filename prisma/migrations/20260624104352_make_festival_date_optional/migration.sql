-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FestivalCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "coverImage" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FestivalCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FestivalCard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "festivalDate" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "highResImage" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#FF6B35',
    "secondaryColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "status" "CardStatus" NOT NULL DEFAULT 'DRAFT',
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "logoX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "logoY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "logoWidth" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "logoHeight" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "businessNameX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "businessNameY" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "businessNameFontSize" INTEGER NOT NULL DEFAULT 24,
    "businessNameColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "phoneX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "phoneY" DOUBLE PRECISION NOT NULL DEFAULT 240,
    "phoneColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "emailX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "emailY" DOUBLE PRECISION NOT NULL DEFAULT 270,
    "emailColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "websiteX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "websiteY" DOUBLE PRECISION NOT NULL DEFAULT 300,
    "websiteColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "addressX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "addressY" DOUBLE PRECISION NOT NULL DEFAULT 330,
    "addressColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "taglineX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "taglineY" DOUBLE PRECISION NOT NULL DEFAULT 360,
    "taglineColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FestivalCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT,
    "ownerName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "whatsapp" TEXT,
    "tagline" TEXT,
    "gstNumber" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'PNG',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FestivalCategory_slug_key" ON "FestivalCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_userId_key" ON "BusinessProfile"("userId");

-- AddForeignKey
ALTER TABLE "FestivalCard" ADD CONSTRAINT "FestivalCard_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FestivalCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadHistory" ADD CONSTRAINT "DownloadHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadHistory" ADD CONSTRAINT "DownloadHistory_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "FestivalCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
