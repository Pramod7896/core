// seeders/initialSuperAdmin.seed.js
import bcrypt from "bcrypt";
import { sequelize } from "../config/database.js";
import { User, Enterprize, Page } from "../models/index.js";

const isDirectRun = process.argv[1]?.includes("initialSuperAdmin.seed.js");

const seedSuperAdmin = async () => {
  try {
    // Optional: create a default enterprize
    const [enterprize] = await Enterprize.findOrCreate({
      where: { enterprize_name: "Nextastra Enterprize" },
      defaults: {
        enterprize_status: "active",
        created_by: null,
        updated_by: null,
      },
    });

    const superadminUsername = process.env.SUPERADMIN_USERNAME || "superadmin";
    const superadminEmail =
      process.env.SUPERADMIN_EMAIL || "superadmin@nextastra.com";

    // Check if superadmin already exists (per enterprize)
    const existing = await User.findOne({
      where: { user_name: superadminUsername, enterprize_fid: enterprize.enterprize_id },
    });
    if (existing) {
      console.log("Superadmin user already exists");
      return;
    }

    // Hash the password
    const plainPassword =
      process.env.SUPERADMIN_PASSWORD || "Pass@123";
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Create superadmin user
    await User.create({
      enterprize_fid: enterprize.enterprize_id,
      user_fullname: "Super Yadav",
      user_name: superadminUsername,
      user_email: superadminEmail,
      user_password: passwordHash,
      is_super_admin: true,
      user_status: "active",
      created_by: null,
      updated_by: null,
    });

    console.log("Superadmin user created successfully");

    // Insert default page management records (drives the dynamic sidebar + permissions)
    const pagesToEnsure = [
      {
        page_name: "Page Management",
        model_name: "Page",
        page_route: "/page/Page",
        page_api: "/api/v1/pages/get-page-data",
        page_icon: "grid",
      },
      {
        page_name: "User Management",
        model_name: "User",
        page_route: "/page/User",
        page_api: "/api/v1/pages/get-page-data",
        page_icon: "people",
      },
      {
        page_name: "Role Management",
        model_name: "Role",
        page_route: "/page/Role",
        page_api: "/api/v1/pages/get-page-data",
        page_icon: "shield-lock",
      },
      {
        page_name: "Enterprize Management",
        model_name: "Enterprize",
        page_route: "/page/Enterprize",
        page_api: "/api/v1/pages/get-page-data",
        page_icon: "building",
      },
      {
        page_name: "Customer Management",
        model_name: "Customer",
        page_route: "/page/Customer",
        page_api: "/api/v1/pages/get-page-data",
        page_icon: "person-vcard",
      },
      {
        page_name: "Audit Logs",
        model_name: "AuditLog",
        page_route: "/page/AuditLog",
        page_api: "/api/v1/pages/get-page-data",
        page_icon: "clipboard-data",
      },
    ];

    for (const page of pagesToEnsure) {
      const [record] = await Page.findOrCreate({
        where: {
          enterprize_fid: enterprize.enterprize_id,
          model_name: page.model_name,
        },
        defaults: {
          enterprize_fid: enterprize.enterprize_id,
          page_name: page.page_name,
          page_route: page.page_route,
          model_name: page.model_name,
          page_api: page.page_api,
          page_icon: page.page_icon,
          is_active: true,
          page_status: "active",
          created_by: null,
          updated_by: null,
        },
      });

      console.log("Ensured page:", record.page_name);
    }
  } catch (error) {
    console.error("Failed to create superadmin:", error);
  } finally {
    // Keep connection open when seeder is called from server startup.
    if (isDirectRun) {
      await sequelize.close();
    }
  }
};

// Run the seeder only when this file is executed directly
if (isDirectRun) {
  seedSuperAdmin();
}

export default seedSuperAdmin;
