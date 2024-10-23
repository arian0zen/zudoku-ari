/* eslint-disable no-console */
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRightIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useMatch } from "react-router-dom";
import type { SidebarItemCategory } from "../../../config/validators/SidebarSchema.js";
import { cn } from "../../util/cn.js";
import { joinPath } from "../../util/joinPath.js";
import { useViewportAnchor } from "../context/ViewportAnchorContext.js";
import { useTopNavigationItem } from "../context/ZudokuContext.js";
import { navigationListItem, SidebarItem } from "./SidebarItem.js";
import { useIsCategoryOpen } from "./utils.js";

export const SidebarCategory = ({
  category,
  level,
}: {
  category: SidebarItemCategory;
  level: number;
}) => {
  const topNavItem = useTopNavigationItem();
  const isCategoryOpen = useIsCategoryOpen(category);
  const [hasInteracted, setHasInteracted] = useState(false);

  const isCollapsible = category.collapsible ?? true;
  const isCollapsed = category.collapsed ?? true;
  const isDefaultOpen = Boolean(
    !isCollapsible || !isCollapsed || isCategoryOpen,
  );
  const [open, setOpen] = useState(isDefaultOpen);
  const isActive = useMatch(joinPath(topNavItem?.id, category.link?.id));
  const { activeAnchor } = useViewportAnchor();

  useEffect(() => {
    // this is triggered when an item from the sidebar is clicked
    // and the sidebar, enclosing this item, is not opened
    if (isCategoryOpen) {
      setOpen(true);
    }
  }, [isCategoryOpen]);

  const categoryLabel = useMemo(
    () => category.label.toLowerCase(),
    [category.label],
  );

  // this is useful when sidebar is collapsed and then user scrolls to an anchor link in the content then the sidebar should open to show the active category
  useEffect(() => {
    if (!activeAnchor) return;
    // Don't auto-close if user has manually interacted with this category
    if (hasInteracted) return;

    const currentActiveCategory = activeAnchor.split("-")[0];
    const shouldBeOpen = currentActiveCategory === categoryLabel;

    console.log("currentActiveCategory", activeAnchor);
    console.log("categoryLabel", categoryLabel);

    setOpen(shouldBeOpen);
  }, [activeAnchor, categoryLabel, hasInteracted]);

  const ToggleButton = isCollapsible && (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setOpen((prev) => !prev);
        setHasInteracted(true);
      }}
    >
      <ChevronRightIcon
        size={16}
        className={cn(
          hasInteracted && "transition",
          "shrink-0 group-data-[state=open]:rotate-90",
        )}
      />
    </button>
  );

  return (
    <Collapsible.Root
      className="flex flex-col"
      defaultOpen={isDefaultOpen}
      open={open}
      onOpenChange={() => setOpen(true)}
    >
      <Collapsible.Trigger className="group" asChild disabled={!isCollapsible}>
        <div
          onClick={() => setHasInteracted(true)}
          className={navigationListItem({
            isActive: false,
            isTopLevel: level === 0,
            className: [
              "text-start",
              isCollapsible
                ? "cursor-pointer"
                : "cursor-default hover:bg-transparent",
            ],
          })}
        >
          {category.icon && (
            <category.icon
              size={16}
              className={cn(
                "align-[-0.125em] -translate-x-1",
                isActive && "text-primary",
              )}
            />
          )}
          {category.link?.type === "doc" ? (
            <NavLink
              to={joinPath(topNavItem?.id, category.link.id)}
              className="flex-1"
              onClick={() => {
                // if it is the current path and closed then open it because there's no path change to trigger the open
                if (isActive && !open) {
                  setOpen(true);
                }
              }}
            >
              <div
                className={cn(
                  "flex items-center gap-2 justify-between w-full",
                  isActive ? "text-primary" : "text-foreground/80",
                )}
              >
                <div className="truncate">{category.label}</div>
                {ToggleButton}
              </div>
            </NavLink>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2 truncate w-full">{category.label}</div>
              {ToggleButton}
            </div>
          )}
        </div>
      </Collapsible.Trigger>
      <Collapsible.Content
        className={cn(
          // CollapsibleContent class is used to animate and it should only be applied when the user has triggered the toggle or the category is collapsed (if it was collapsed by default then while scrolling to an anchor link in the content it should animate as well)
          (hasInteracted || category.collapsed) && "CollapsibleContent",
        )}
      >
        <ul className="mt-1 border-l ms-0.5">
          {category.items.map((item) => (
            <SidebarItem
              key={
                ("id" in item ? item.id : "") +
                ("href" in item ? item.href : "") +
                item.label
              }
              level={level + 1}
              item={item}
            />
          ))}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
