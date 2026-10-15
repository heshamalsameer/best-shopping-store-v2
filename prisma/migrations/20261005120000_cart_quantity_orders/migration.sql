CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'CASH');

DROP INDEX "Cart_title_key";

ALTER TABLE "Cart" ADD COLUMN "productId" INTEGER,
ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1;

UPDATE "Cart" c SET "productId" = p."id" FROM "Product" p WHERE c."title" = p."title";

CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "cardBrand" TEXT,
    "cardLast4" VARCHAR(4),
    "subtotal" DOUBLE PRECISION NOT NULL,
    "shipping" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "couponCode" TEXT,
    "fullName" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "address" TEXT NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "image" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productId" INTEGER,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderEvent" (
    "id" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Cart_userId_productId_key" ON "Cart"("userId", "productId");

CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");

ALTER TABLE "Cart" ADD CONSTRAINT "Cart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
