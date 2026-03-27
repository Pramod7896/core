export const modelFieldMapping = {
  // ===================== PAGE =====================
  PAGE: {
    stats: true,
    columns: [
      { key: "page_id", label: "ID", sortable: true },
      { key: "page_name", label: "Page Name", sortable: true },
      { key: "page_route", label: "Route", sortable: true },
      { key: "model_name", label: "Model", sortable: true },
      { key: "page_api", label: "API" },
      { key: "page_icon", label: "Icon" },
      { key: "page_status", label: "Status" },
      {
        key: "updated_timestamp",
        label: "Updated At",
        type: "datetime",
        sortable: true,
      },
    ],
    form: [
      { name: "page_name", label: "Page Name", type: "text", required: true },
      { name: "page_icon", label: "Page Icon", type: "text", required: true },
      { name: "page_route", label: "Page Route", type: "text", required: true },
      { name: "model_name", label: "Model Name", type: "text", required: true },
      { name: "page_api", label: "Page API", type: "text" },

      // {
      //   name: "page_status",
      //   label: "Status",
      //   type: "select",
      //   options: [
      //     { label: "Active", value: "active" },
      //     { label: "Inactive", value: "inactive" },
      //   ],
      // },
    ],
  },

  // ===================== USER =====================

  USER: {
    stats: true,

    // =====================
    // TABLE COLUMNS
    // =====================
    columns: [
      { key: "user_id", label: "ID" },

      { key: "user_profile_pic", label: "Profile Pic" },

      { key: "enterprize_name", label: "Enterprize" },

      { key: "role_name", label: "Role" },

      { key: "user_fullname", label: "Full Name" },

      { key: "user_name", label: "User Name" },

      { key: "user_email", label: "Email" },

      { key: "user_status", label: "Status" },

      // { key: "is_super_admin", label: "Super Admin" },

      // { key: "created_by", label: "Created By" },

      // { key: "updated_by", label: "Updated By" },

      // { key: "created_timestamp", label: "Created" },

      { key: "updated_timestamp", label: "Updated", type: "datetime" },
    ],

    // =====================
    // FORM FIELDS
    // =====================
    form: [
      // {
      //   name: "user_profile_pic",
      //   label: "Profile Picture",
      //   type: "file",
      // },

      {
        name: "user_fullname",
        label: "Full Name",
        type: "text",
        required: true,
      },

      {
        name: "user_name",
        label: "User Name",
        type: "text",
        required: true,
      },

      {
        name: "user_email",
        label: "Email",
        type: "email",
        required: true,
      },

      {
        name: "user_password",
        label: "Password",
        type: "password",
        required: true,
      },

      // {
      //   name: "is_super_admin",
      //   label: "Super Admin",
      //   type: "select",
      //   required: true,
      //   options: [
      //     { label: "Yes", value: true },
      //     { label: "No", value: false },
      //   ],
      // },
    ],

    // =====================
    // SEARCH SUPPORT
    // =====================

    search: ["user_fullname", "user_name", "user_email"],

    // =====================
    // SORT SUPPORT
    // =====================

    sortable: [
      "user_id",
      "user_fullname",
      "user_name",
      "user_email",
      "created_timestamp",
    ],

    // =====================
    // PRIMARY KEY
    // =====================

    primaryKey: "user_id",

    // =====================
    // TITLE FIELD
    // =====================

    titleField: "user_fullname",
  },

  // ===================== ROLE =====================
  ROLE: {
    stats: true,
    columns: [
      { key: "role_id", label: "ID", sortable: true },
      { key: "enterprize_name", label: "Enterprize" },
      { key: "role_name", label: "Role Name", sortable: true },
      { key: "role_level", label: "Role Level", sortable: true },
      { key: "role_status", label: "Status" },
      {
        key: "updated_timestamp",
        label: "Updated At",
        type: "datetime",
        sortable: true,
      },
    ],
    form: [
      { name: "role_name", label: "Role Name", type: "text", required: true },
      { name: "role_level", label: "Role Level", type: "number", required: true },
      // {
      //   name: "role_status",
      //   label: "Status",
      //   type: "select",
      //   options: [
      //     { label: "Active", value: "active" },
      //     { label: "Inactive", value: "inactive" },
      //   ],
      // },
    ],
  },

  // ===================== ENTERPRIZE =====================
  ENTERPRIZE: {
    stats: true,
    columns: [
      { key: "enterprize_id", label: "ID", sortable: true },
      { key: "enterprize_name", label: "Enterprize Name", sortable: true },
      { key: "enterprize_city", label: "City" },
      { key: "enterprize_state", label: "State" },
      { key: "enterprize_country", label: "Country" },
      { key: "enterprize_status", label: "Status" },
      // { key: "created_timestamp", label: "Created At", sortable: true },
      {
        key: "updated_timestamp",
        label: "Updated At",
        type: "datetime",
        sortable: true,
      },
    ],
    form: [
      {
        name: "enterprize_name",
        label: "Enterprize Name",
        type: "text",
        required: true,
        section: "Enterprize Details",
      },
      {
        name: "enterprize_address_1",
        label: "Address 1",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_address_2",
        label: "Address 2",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_city",
        label: "City",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_state",
        label: "State",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_zip_code",
        label: "ZIP Code",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_country",
        label: "Country",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_logo",
        label: "Logo URL",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_theme",
        label: "Theme",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_phone_1",
        label: "Phone 1",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_phone_2",
        label: "Phone 2",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_mobile_1",
        label: "Mobile 1",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_mobile_2",
        label: "Mobile 2",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_email_1",
        label: "Email 1",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "enterprize_email_2",
        label: "Email 2",
        type: "text",
        section: "Enterprize Details",
      },
      {
        name: "contact_person_name",
        label: "Contact Person Name",
        type: "text",
        section: "Primary Contact Person",
      },
      {
        name: "contact_person_phone",
        label: "Contact Person Phone",
        type: "text",
        section: "Primary Contact Person",
      },
      {
        name: "contact_person_email",
        label: "Contact Person Email",
        type: "text",
        section: "Primary Contact Person",
      },
      {
        name: "contact_person_mobile",
        label: "Contact Person Mobile",
        type: "text",
        section: "Primary Contact Person",
      },
      {
        name: "contact_person_designation",
        label: "Contact Person Designation",
        type: "text",
        section: "Primary Contact Person",
      },
      {
        name: "alt_contact_person_name",
        label: "Alt Contact Name",
        type: "text",
        section: "Alternate Contact Person",
      },
      {
        name: "alt_contact_person_phone",
        label: "Alt Contact Phone",
        type: "text",
        section: "Alternate Contact Person",
      },
      {
        name: "alt_contact_person_email",
        label: "Alt Contact Email",
        type: "text",
        section: "Alternate Contact Person",
      },
      {
        name: "alt_contact_person_mobile",
        label: "Alt Contact Mobile",
        type: "text",
        section: "Alternate Contact Person",
      },
      {
        name: "alt_contact_person_designation",
        label: "Alt Contact Designation",
        type: "text",
        section: "Alternate Contact Person",
      },
      // {
      //   name: "enterprize_status",
      //   label: "Status",
      //   type: "select",
      //   options: [
      //     { label: "Active", value: "active" },
      //     { label: "Inactive", value: "inactive" },
      //   ],
      // },
    ],
  },

  // ===================== CUSTOMER =====================
  CUSTOMER: {
    stats: true,
    columns: [
      { key: "customer_id", label: "ID", sortable: true },
      { key: "enterprize_name", label: "Enterprize" },
      { key: "customer_name", label: "Customer Name", sortable: true },
      { key: "customer_contact_number", label: "Contact Number" },
      { key: "customer_email", label: "Email" },
      { key: "customer_agency_name", label: "Agency Name" },
      { key: "customer_status", label: "Status" },
      {
        key: "updated_timestamp",
        label: "Updated At",
        type: "datetime",
        sortable: true,
      },
    ],
    form: [
      {
        name: "customer_name",
        label: "Customer Name",
        type: "text",
        required: true,
        section: "Customer Details",
      },
      {
        name: "customer_contact_number",
        label: "Customer Contact Number",
        type: "text",
        section: "Customer Details",
      },
      {
        name: "customer_email",
        label: "Customer Email",
        type: "email",
        section: "Customer Details",
      },
      {
        name: "customer_address",
        label: "Customer Address",
        type: "text",
        section: "Customer Details",
      },
      {
        name: "customer_agency_name",
        label: "Agency Name",
        type: "text",
        section: "Agency Details",
      },
      {
        name: "customer_agency_contact_number",
        label: "Agency Contact Number",
        type: "text",
        section: "Agency Details",
      },
      {
        name: "customer_agency_address",
        label: "Agency Address",
        type: "text",
        section: "Agency Details",
      },
      {
        name: "customer_agenecy_designation",
        label: "Agency Designation",
        type: "text",
        section: "Agency Details",
      },
      {
        name: "customer_agency_alternate_contact_number",
        label: "Agency Alternate Contact Number",
        type: "text",
        section: "Agency Details",
      },
      {
        name: "customer_agency_alternate_name",
        label: "Agency Alternate Name",
        type: "text",
        section: "Agency Details",
      },
      {
        name: "customer_agency_alternate_email",
        label: "Agency Alternate Email",
        type: "email",
        section: "Agency Details",
      },
      // {
      //   name: "customer_status",
      //   label: "Status",
      //   type: "select",
      //   options: [
      //     { label: "Active", value: "active" },
      //     { label: "Inactive", value: "inactive" },
      //   ],
      // },
    ],
  },

  // ===================== AUDIT LOG =====================

  AUDITLOG: {
    stats: true,

    // =====================
    // TABLE COLUMNS
    // =====================

    columns: [
      // {
      //   key: "audit_log_id",
      //   label: "ID",
      //   sortable: true,
      // },

      {
        key: "user_fid",
        label: "User",
        sortable: true,
      },

      {
        key: "enterprize_fid",
        label: "Enterprize_id",
        sortable: true,
      },

      {
        key: "audit_log_action",
        label: "Action",
        sortable: true,
      },

      {
        key: "audit_log_description",
        label: "Description",
      },

      {
        key: "audit_log_ip",
        label: "IP Address",
        sortable: true,
      },

      // {
      //   key: "audit_log_status",
      //   label: "Status",
      // },

      // {
      //   key: "created_by",
      //   label: "Created By",
      // },

      // {
      //   key: "updated_by",
      //   label: "Updated By",
      // },

      // {
      //   key: "created_timestamp",
      //   label: "Created At",
      //   sortable: true,
      // },

      {
        key: "updated_timestamp",
        label: "Updated At",
        sortable: true,
        type: "datetime",
      },
    ],

    // =====================
    // FORM (Usually audit log no create/edit)
    // =====================

    form: [],

    // =====================
    // SEARCH SUPPORT
    // =====================

    search: ["audit_log_action", "audit_log_description", "audit_log_ip"],

    // =====================
    // SORT SUPPORT
    // =====================

    sortable: ["audit_log_id", "audit_log_action", "created_timestamp"],

    // =====================
    // PRIMARY KEY
    // =====================

    primaryKey: "audit_log_id",

    // =====================
    // TITLE FIELD
    // =====================

    titleField: "audit_log_action",
  },
};
