import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

import { useDispatch } from "react-redux";
import { setCurrentPageName } from "../../redux/pageSlice";
import {
  getSidebarMenuOrderAPI,
  updateSidebarMenuOrderAPI,
} from "../../api/sidebarMenu";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import "../LayoutCss/sidebar.css";

import VelaLogo from "../../assets/Logo/project_icon.svg";
import VelaKoda from "../../assets/Logo/project_logo.svg";

const APP_VERSION = process.env.REACT_APP_VERSION || "1.0.1";

const Sidebar = () => {
  const location = useLocation();
  const { role: routeRole } = useParams();

  const dispatch = useDispatch();

  const { pages, user, roles } = useAuth();

  const [expanded, setExpanded] = useState(true);
  const [orderedPages, setOrderedPages] = useState([]);
  const [orderLoaded, setOrderLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const toggleSidebar = () => setExpanded(!expanded);

  const currentRole = user?.is_super_admin
    ? "superadmin"
    : roles?.[0]?.toLowerCase() || String(routeRole || "").toLowerCase() || null;

  const allowedPages = user?.is_super_admin
    ? pages
    : pages?.filter((page) => page.can_view);

  const staticMenus = [
    {
      name: "Dashboard",
      icon: "columns-gap",
      route: currentRole ? `/${currentRole}/dashboard` : "/login",
      show: true,
    },

    {
      name: "RBAC",
      icon: "shield-lock",
      route: "/superadmin/rbac",
      show:
        user?.is_super_admin ||
        allowedPages?.some((p) => p.page_route === "/superadmin/rbac"),
    },
  ];

  const handleClick = (pageName) => {
    dispatch(setCurrentPageName(pageName));
  };

  /**
   * =============================
   * Drag & Drop Ordering (Dynamic Pages Only)
   * =============================
   */

  useEffect(() => {
    let active = true;
    const role = String(currentRole || "").toLowerCase();

    const loadSidebarOrder = async () => {
      if (!role) return;

      if (active) {
        setOrderLoaded(false);
      }

      if (!allowedPages?.length) {
        if (active) {
          setOrderedPages([]);
          setOrderLoaded(true);
        }
        return;
      }

      try {
        const response = await getSidebarMenuOrderAPI(role);
        const serverOrder = response?.data?.data?.order || [];
        const normalizedOrder = Array.isArray(serverOrder)
          ? serverOrder
              .map((id) => String(id))
              .map((id) => (id.startsWith("page:") ? id.slice(5) : id))
          : [];

        if (!Array.isArray(normalizedOrder) || normalizedOrder.length === 0) {
          if (active) {
            setOrderedPages(allowedPages);
            setOrderLoaded(true);
          }
          return;
        }

        const byId = new Map(
          allowedPages.map((page) => [String(page.page_id), page]),
        );

        const next = [];
        normalizedOrder.forEach((id) => {
          const page = byId.get(String(id));
          if (page) next.push(page);
        });

        const missing = allowedPages.filter(
          (page) => !normalizedOrder.includes(String(page.page_id)),
        );

        if (active) {
          setOrderedPages([...next, ...missing]);
          setOrderLoaded(true);
        }
      } catch (error) {
        if (active) {
          setOrderedPages(allowedPages || []);
          setOrderLoaded(true);
        }
      }
    };

    loadSidebarOrder();

    return () => {
      active = false;
    };
  }, [allowedPages, currentRole]);

  const orderedIds = useMemo(
    () => orderedPages.map((page) => String(page.page_id)),
    [orderedPages],
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setIsDragging(false);
    if (!over || active.id === over.id) return;

    const fromIndex = orderedPages.findIndex(
      (page) => String(page.page_id) === String(active.id),
    );
    const toIndex = orderedPages.findIndex(
      (page) => String(page.page_id) === String(over.id),
    );
    if (fromIndex === -1 || toIndex === -1) return;

    const next = arrayMove(orderedPages, fromIndex, toIndex);
    setOrderedPages(next);

    if (orderLoaded && currentRole) {
      updateSidebarMenuOrderAPI(
        String(currentRole).toLowerCase(),
        next.map((page) => String(page.page_id)),
      ).catch((error) => console.warn("Failed to save sidebar order", error));
    }
  };

  const handleLinkClick = (event, pageName) => {
    if (isDragging) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    handleClick(pageName);
  };

  return (
    <div
      className={`sidebar d-flex flex-column ${
        expanded ? "expanded" : "collapsed"
      }`}
    >
      {/* ========================= */}
      {/* LOGO */}
      {/* ========================= */}

      <div
        className={`logo-section ${
          expanded
            ? "d-flex justify-content-between align-items-center pe-3 py-2"
            : "d-flex justify-content-center align-items-center py-2"
        }`}
      >
        <img
          src={expanded ? VelaKoda : VelaLogo}
          alt="Logo"
          style={{
            width: expanded ? "160px" : "40px",
            height: expanded ? "30px" : "40px",
            objectFit: "contain",
          }}
        />

        <button onClick={toggleSidebar} className="sidebar-toggler">
          <i
            className={`bi ${
              expanded ? "bi-chevron-double-left" : "bi-chevron-double-right"
            }`}
          />
        </button>
      </div>

      {/* ========================= */}
      {/* STATIC MENU (NOT DRAGGABLE) */}
      {/* ========================= */}

      <ul className="sidebar-menu">
        {staticMenus
          .filter((menu) => menu.show)
          .map((menu) => {
          const isActive = location.pathname === menu.route;

          return (
            <li key={menu.name} className={isActive ? "active" : ""}>
              <Link to={menu.route} onClick={() => handleClick(menu.name)}>
                <i className={`bi bi-${menu.icon}`} />

                {expanded && <span>{menu.name}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ========================= */}
      {/* DYNAMIC MENU (DRAGGABLE) */}
      {/* ========================= */}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setIsDragging(false)}
      >
        <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
          <ul className={`sidebar-menu ${isDragging ? "is-dragging" : ""}`}>
            {orderedPages?.map((page) => {
              const route = currentRole
                ? `/${currentRole}/page/${page.model_name}`
                : "/login";
              const isActive = location.pathname === route;

              return (
                <SortableMenuItem
                  key={page.page_id}
                  id={String(page.page_id)}
                  isActive={isActive}
                >
                  <Link
                    to={route}
                    onClick={(event) => handleLinkClick(event, page.page_name)}
                  >
                    <i className={`bi bi-${page.page_icon || "grid"}`} />

                    {expanded && <span>{page.page_name}</span>}
                  </Link>
                </SortableMenuItem>
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="sidebar-version">
        {expanded ? (
          <span>{`Version ${APP_VERSION}`}</span>
        ) : (
          <span>{`v${APP_VERSION}`}</span>
        )}
      </div>
    </div>
  );
};

const SortableMenuItem = ({ id, isActive, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`sidebar-draggable ${isActive ? "active" : ""} ${
        isDragging ? "dragging" : ""
      } ${isOver ? "drag-over" : ""}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </li>
  );
};

export default Sidebar;
