import { Sequelize } from "sequelize-typescript"
import express, { Express } from "express";
import request from "supertest";
import Address from "../../../modules/@shared/domain/value-object/address";
import { ClientModel } from "../../../modules/client-adm/repository/client.model";
import { clientRoute } from "../routes/client.route";

describe("E2E Tests - Client", () => {
  let sequelize: Sequelize
  const app: Express = express()
  app.use(express.json())
  app.use("/clients", clientRoute);

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      sync: { force: true }
    })

    await sequelize.addModels([ClientModel])
    await sequelize.sync()
  })

  afterEach(async () => {
    await sequelize.close()
  })

  it("should create a client", async () => {

    const input = {
      id: "1",
      name: "Lucian",
      email: "lucian@123.com",
      document: "1234-5678",
      address: new Address(
        "Rua 123",
        "99",
        "Casa Verde",
        "Criciúma",
        "SC",
        "88888-888",
      )
    }
    const clientResponse = await request(app)
      .post("/clients")
      .send(input);

      //TODO: usar factory
    const client = await ClientModel.findOne({ where: { id: input.id } })

    expect(clientResponse.status).toEqual(200);
    expect(client.id).toEqual(input.id)
    expect(client.name).toEqual(input.name)
    expect(client.email).toEqual(input.email)
    expect(client.document).toEqual(input.document)
    expect(client.street).toEqual(input.address.street)
    expect(client.number).toEqual(input.address.number)
    expect(client.complement).toEqual(input.address.complement)
    expect(client.city).toEqual(input.address.city)
    expect(client.state).toEqual(input.address.state)
    expect(client.zipcode).toEqual(input.address.zipCode)
    expect(client.createdAt).toBeDefined()
    expect(client.updatedAt).toBeDefined()

  });
})