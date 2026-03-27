import api from "./api";

export const getSidebarMenuOrderAPI = (role) => {
  return api.get("/sidebar-menu/order", { params: { role } });
};

export const updateSidebarMenuOrderAPI = (role, order) => {
  return api.put("/sidebar-menu/order", { role, order });
};

