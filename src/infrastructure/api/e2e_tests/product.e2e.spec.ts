import { Sequelize } from "sequelize-typescript"
import express, { Express } from "express";
import { Umzug } from "umzug"
import request from "supertest";
import { ProductModel } from "../../../modules/product-adm/repository/product.model";
import { productRoute } from "../routes/product.route";
import { migrator } from "../../../migrations/config-migrations/migrator";


describe("E2E Tests -  Product", () => {
  let sequelize: Sequelize;
  let migration: Umzug<any>;
  const app: Express = express()
  app.use(express.json())
  app.use("/products", productRoute)

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",      
      logging: false
    });

    await sequelize.addModels([ProductModel]);    
    migration = migrator(sequelize)
    await migration.up()
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a product", async () => {
    const input = {
      id: "1",
      name: "Product 1",
      description: "Product 1 description",
      purchasePrice: 100,
      salesPrice : 200,
      stock: 10      
    }

    //TODO: usar factory
    const productsResponse = await request(app)
      .post("/products")
      .send(input);

    const product = await ProductModel.findOne({ where: { id: input.id } });

    expect(productsResponse.status).toBe(200);
    expect(product.id).toBe(input.id);
    expect(product.name).toBe(input.name);
    expect(product.description).toBe(input.description);
    expect(product.purchasePrice).toBe(input.purchasePrice);   
    expect(product.salesPrice).toBe(input.salesPrice); 
    expect(product.stock).toBe(input.stock);
  });
})