-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseTransaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "note" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BaseTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseTransaction" (
    "id" TEXT NOT NULL,
    "baseTransactionId" TEXT NOT NULL,

    CONSTRAINT "ExpenseTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeTransaction" (
    "id" TEXT NOT NULL,
    "baseTransactionId" TEXT NOT NULL,

    CONSTRAINT "IncomeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferTransaction" (
    "id" TEXT NOT NULL,
    "baseTransactionId" TEXT NOT NULL,
    "receipientAccountId" TEXT NOT NULL,

    CONSTRAINT "TransferTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseTransaction_baseTransactionId_key" ON "ExpenseTransaction"("baseTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "IncomeTransaction_baseTransactionId_key" ON "IncomeTransaction"("baseTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferTransaction_baseTransactionId_key" ON "TransferTransaction"("baseTransactionId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseTransaction" ADD CONSTRAINT "BaseTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseTransaction" ADD CONSTRAINT "ExpenseTransaction_baseTransactionId_fkey" FOREIGN KEY ("baseTransactionId") REFERENCES "BaseTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeTransaction" ADD CONSTRAINT "IncomeTransaction_baseTransactionId_fkey" FOREIGN KEY ("baseTransactionId") REFERENCES "BaseTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferTransaction" ADD CONSTRAINT "TransferTransaction_baseTransactionId_fkey" FOREIGN KEY ("baseTransactionId") REFERENCES "BaseTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferTransaction" ADD CONSTRAINT "TransferTransaction_receipientAccountId_fkey" FOREIGN KEY ("receipientAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
