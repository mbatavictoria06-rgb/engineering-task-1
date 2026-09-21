import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, OrderStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  faker.seed(123);
  console.log('Clearing existing data for a clean, repeatable seed...');
  // Delete in reverse dependency order
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Seeding Categories (250)...');
  const categoriesData = Array.from({ length: 250 }).map(() => ({
    name: faker.commerce.department() + ' ' + faker.string.uuid().substring(0, 5),
    description: faker.commerce.productDescription(),
  }));
  await prisma.category.createMany({ data: categoriesData });
  const categories = await prisma.category.findMany();

  console.log('Seeding Products (400)...');
  const productsData = Array.from({ length: 400 }).map(() => ({
    categoryId: faker.helpers.arrayElement(categories).id,
    name: faker.commerce.productName() + ' ' + faker.string.uuid().substring(0, 5),
    description: faker.commerce.productDescription(),
    price: faker.number.float({ min: 5, max: 1000, fractionDigits: 2 }),
    stockQuantity: faker.number.int({ min: 0, max: 500 }),
    isActive: faker.datatype.boolean({ probability: 0.9 }),
  }));
  await prisma.product.createMany({ data: productsData });
  const products = await prisma.product.findMany();

  console.log('Seeding Customers (400)...');
  const customersData = Array.from({ length: 400 }).map((_, i) => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: `user${i}_${faker.string.uuid().substring(0, 5)}_${faker.internet.email()}`.substring(0, 100),
    phone: faker.phone.number({ style: 'international' }).substring(0, 20),
    city: faker.location.city(),
    country: faker.location.country(),
  }));
  await prisma.customer.createMany({ data: customersData });
  const customers = await prisma.customer.findMany();

  console.log('Seeding Orders (400) and Order Items (approx. 800)...');
  const statuses = Object.values(OrderStatus);
  
  const orderOperations = [];
  
  for (let i = 0; i < 400; i++) {
    const customer = faker.helpers.arrayElement(customers);
    // Average 2 order items per order -> ~800 Order Items
    const numItems = faker.number.int({ min: 1, max: 3 });
    const selectedProducts = faker.helpers.arrayElements(products, numItems);
    
    let totalAmount = 0;
    const orderItemsData = selectedProducts.map(p => {
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = p.price; // match the product's price exactly
      totalAmount += parseFloat(unitPrice.toString()) * quantity;
      return {
        productId: p.id,
        quantity,
        unitPrice,
      };
    });

    orderOperations.push(
      prisma.order.create({
        data: {
          customerId: customer.id,
          status: faker.helpers.arrayElement(statuses),
          totalAmount,
          orderItems: {
            create: orderItemsData,
          },
        },
      })
    );
  }

  await Promise.all(orderOperations);

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
