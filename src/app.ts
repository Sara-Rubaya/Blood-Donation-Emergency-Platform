import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import bloodRequestRoutes from "./modules/bloodRequest/bloodRequest.routes";
// import userRoutes from "./modules/user/user.routes";
// import donationRoutes from "./modules/donation/donation.routes";
// import paymentRoutes from "./modules/payment/payment.routes";
// import bloodBankRoutes from "./modules/bloodBank/bloodBank.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { ApiResponse } from "./utils/ApiResponse";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json(ApiResponse.success("Server is running")));

app.use("/api/auth", authRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/donations", donationRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/blood-banks", bloodBankRoutes);

app.use((req, res) => res.status(404).json(ApiResponse.error("Route not found")));
app.use(errorHandler);

export default app;
