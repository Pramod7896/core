export const pageConfig = {
  PAGE_MANAGEMENT: {
    title: "Page Management",

    code: "PAGE_MANAGEMENT",

    api: "/pages",

    stats: true,

    columns: [
      {
        key: "page_name",

        label: "Page Name",

        sortable: true,
      },

      {
        key: "page_route",

        label: "Route",

        sortable: true,
      },

      {
        key: "page_status",

        label: "Status",
      },

      {
        key: "created_timestamp",

        label: "Created",
      },
    ],

    form: [
      {
        name: "page_name",

        label: "Page Name",

        type: "text",

        required: true,
      },

      {
        name: "page_route",

        label: "Page Route",

        type: "text",

        required: true,
      },

      {
        name: "page_icon",

        label: "Page Icon",

        type: "text",
      },

      {
        name: "page_status",

        label: "Status",

        type: "select",

        options: [
          {
            label: "Active",

            value: "active",
          },

          {
            label: "Inactive",

            value: "inactive",
          },
        ],
      },
    ],
  },

  USER_MANAGEMENT: {
    title: "User Management",

    code: "USER_MANAGEMENT",

    api: "/users",

    stats: true,

    columns: [
      {
        key: "user_name",

        label: "User Name",
      },

      {
        key: "user_email",

        label: "Email",
      },

      {
        key: "user_status",

        label: "Status",
      },
      {
        key: "user_name",

        label: "User Name",
      },

      {
        key: "user_email",

        label: "Email",
      },

      {
        key: "user_status",

        label: "Status",
      },
    ],

    form: [
      {
        name: "user_name",

        label: "User Name",

        type: "text",
      },

      {
        name: "user_email",

        label: "Email",

        type: "text",
      },

      {
        name: "user_status",

        label: "Status",

        type: "select",

        options: [
          {
            label: "Active",

            value: "active",
          },

          {
            label: "Inactive",

            value: "inactive",
          },
        ],
      },
    ],
  },
};
