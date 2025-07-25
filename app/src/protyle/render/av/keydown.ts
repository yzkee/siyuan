import {matchHotKey} from "../../util/hotKey";
import {deleteRow, insertRows, selectRow} from "./row";
import {addDragFill, cellScrollIntoView, popTextCell, updateCellsValue} from "./cell";
import {avContextmenu} from "./action";
import {hasClosestByClassName} from "../../util/hasClosest";
import {Constants} from "../../../constants";
import {upDownHint} from "../../../util/upDownHint";
import {clearSelect} from "../../util/clearSelect";

export const avKeydown = (event: KeyboardEvent, nodeElement: HTMLElement, protyle: IProtyle) => {
    if (!nodeElement.classList.contains("av") || !window.siyuan.menus.menu.element.classList.contains("fn__none")) {
        return false;
    }
    if (event.isComposing) {
        return true;
    }
    // 避免浏览器默认快捷键
    if (matchHotKey("⌘B", event) || matchHotKey("⌘I", event) || matchHotKey("⌘U", event)) {
        event.preventDefault();
        return true;
    }
    const selectCellElement = nodeElement.querySelector(".av__cell--select") as HTMLElement;
    if (selectCellElement) {
        const rowElement = hasClosestByClassName(selectCellElement, "av__row");
        if (!rowElement || rowElement.dataset.type === "ghost") {
            return false;
        }
        const avPanelElement = document.querySelector(".av__panel");
        if (avPanelElement &&
            (event.key === "Backspace" || event.key === "Delete" || event.key === "Escape" ||
                event.key.startsWith("ArrowLeft") || event.key === "Enter" || matchHotKey("⇥", event) ||
                matchHotKey("⇧⇥", event))) {
            avPanelElement.remove();
            event.preventDefault();
            event.stopPropagation();
            return true;
        }
        // 需在 avPanelElement 之后，否则点击资源单元格后删除，资源面板不会更新
        if (event.key === "Backspace" || event.key === "Delete") {
            updateCellsValue(protyle, nodeElement, undefined, Array.from(nodeElement.querySelectorAll(".av__cell--active, .av__cell--select")));
            event.preventDefault();
            return true;
        }
        if (event.key === "Escape") {
            clearSelect(["cell"], nodeElement);
            selectRow(rowElement.querySelector(".av__firstcol"), "select");
            event.preventDefault();
            return true;
        }
        if (event.key === "Enter") {
            popTextCell(protyle, [selectCellElement]);
            event.preventDefault();
            return true;
        }
        let newCellElement;
        if (event.key === "ArrowLeft" || matchHotKey("⇧⇥", event)) {
            const previousRowElement = rowElement.previousElementSibling;
            if (selectCellElement.previousElementSibling && !selectCellElement.previousElementSibling.classList.contains("av__firstcol")) {
                if (selectCellElement.previousElementSibling.classList.contains("av__colsticky")) {
                    newCellElement = selectCellElement.previousElementSibling.lastElementChild;
                    if (newCellElement.classList.contains("av__firstcol")) {
                        newCellElement = undefined;
                    }
                } else if (selectCellElement.previousElementSibling.classList.contains("av__cell")) {
                    newCellElement = selectCellElement.previousElementSibling;
                }
            }
            if (!newCellElement && previousRowElement && !previousRowElement.classList.contains("av__row--header")) {
                const previousCellElements = previousRowElement.querySelectorAll(".av__cell");
                newCellElement = previousCellElements[previousCellElements.length - 1];
            }
            if (newCellElement) {
                clearSelect(["cell"], nodeElement);
                newCellElement.classList.add("av__cell--select");
                addDragFill(newCellElement);
                cellScrollIntoView(nodeElement, newCellElement, false);
            }
            event.preventDefault();
            return true;
        }
        if (event.key === "ArrowRight" || matchHotKey("⇥", event)) {
            const nextRowElement = rowElement.nextElementSibling;
            if (selectCellElement.nextElementSibling && selectCellElement.nextElementSibling.classList.contains("av__cell")) {
                newCellElement = selectCellElement.nextElementSibling;
            } else if (!selectCellElement.nextElementSibling && selectCellElement.parentElement.nextElementSibling) {
                // pin
                newCellElement = selectCellElement.parentElement.nextElementSibling;
            } else if (nextRowElement && !nextRowElement.classList.contains("av__row--footer")) {
                newCellElement = nextRowElement.querySelector(".av__cell");
            }
            if (newCellElement) {
                clearSelect(["cell"], nodeElement);
                newCellElement.classList.add("av__cell--select");
                addDragFill(newCellElement);
                cellScrollIntoView(nodeElement, newCellElement, false);
            } else if (event.key !== "ArrowRight") {
                clearSelect(["cell"], nodeElement);
                insertRows(nodeElement, protyle, 1, rowElement.getAttribute("data-id"));
            }
            event.preventDefault();
            return true;
        }
        if (event.key === "ArrowUp") {
            const previousRowElement = rowElement.previousElementSibling;
            if (previousRowElement && !previousRowElement.classList.contains("av__row--header")) {
                newCellElement = previousRowElement.querySelector(`.av__cell[data-col-id="${selectCellElement.dataset.colId}"]`);
            }
            if (newCellElement) {
                clearSelect(["cell"], nodeElement);
                newCellElement.classList.add("av__cell--select");
                addDragFill(newCellElement);
                cellScrollIntoView(nodeElement, newCellElement);
            }
            event.preventDefault();
            return true;
        }
        if (event.key === "ArrowDown") {
            const nextRowElement = rowElement.nextElementSibling;
            if (nextRowElement && !nextRowElement.classList.contains("av__row--footer")) {
                newCellElement = nextRowElement.querySelector(`.av__cell[data-col-id="${selectCellElement.dataset.colId}"]`);
            }
            if (newCellElement) {
                clearSelect(["cell"], nodeElement);
                newCellElement.classList.add("av__cell--select");
                addDragFill(newCellElement);
                cellScrollIntoView(nodeElement, newCellElement);
            }
            event.preventDefault();
            return true;
        }

        if (!Constants.KEYCODELIST[event.keyCode] ||
            (Constants.KEYCODELIST[event.keyCode].length === 1 &&
                !event.metaKey && !event.ctrlKey &&
                !["⇧", "⌃", "⌥", "⌘"].includes(Constants.KEYCODELIST[event.keyCode]))) {
            if (!selectCellElement.style.backgroundColor) {
                popTextCell(protyle, [selectCellElement]);
            } else {
                event.preventDefault();
            }
            return true;
        }
    }
    const selectRowElements = nodeElement.querySelectorAll(".av__row--select:not(.av__row--header)");
    if (selectRowElements.length > 0) {
        if (matchHotKey("⌘/", event)) {
            event.stopPropagation();
            event.preventDefault();
            avContextmenu(protyle, selectRowElements[0] as HTMLElement, {
                x: nodeElement.querySelector(".layout-tab-bar").getBoundingClientRect().left,
                y: selectRowElements[0].getBoundingClientRect().bottom
            });
            return true;
        }
        if (event.key === "Escape") {
            event.preventDefault();
            selectRow(selectRowElements[0].querySelector(".av__firstcol"), "unselectAll");
            return true;
        }
        if (event.key === "Backspace") {
            event.preventDefault();
            deleteRow(nodeElement, protyle);
            return true;
        }
        if (event.key === "Enter") {
            selectRow(selectRowElements[0].querySelector(".av__firstcol"), "unselectAll");
            popTextCell(protyle, [selectRowElements[0].querySelector(".av__cell")]);
            event.preventDefault();
            return true;
        }
        // TODO event.shiftKey
        if (event.key === "ArrowUp") {
            const previousRowElement = selectRowElements[0].previousElementSibling;
            selectRow(selectRowElements[0].querySelector(".av__firstcol"), "unselectAll");
            if (previousRowElement && !previousRowElement.classList.contains("av__row--header")) {
                selectRow(previousRowElement.querySelector(".av__firstcol"), "select");
                cellScrollIntoView(nodeElement, previousRowElement);
            } else {
                nodeElement.classList.add("protyle-wysiwyg--select");
            }
            event.preventDefault();
            return true;
        }
        if (event.key === "ArrowDown") {
            const nextRowElement = selectRowElements[selectRowElements.length - 1].nextElementSibling;
            selectRow(selectRowElements[0].querySelector(".av__firstcol"), "unselectAll");
            if (nextRowElement && !nextRowElement.classList.contains("av__row--util")) {
                selectRow(nextRowElement.querySelector(".av__firstcol"), "select");
                cellScrollIntoView(nodeElement, nextRowElement);
            } else {
                nodeElement.classList.add("protyle-wysiwyg--select");
            }
            event.preventDefault();
            return true;
        }
    }
    return false;
};

export const bindAVPanelKeydown = (event: KeyboardEvent) => {
    const avPanelElement = document.querySelector(".av__panel");
    if (avPanelElement && window.siyuan.menus.menu.element.classList.contains("fn__none")) {
        if ((avPanelElement.querySelector('[data-type="goSearchRollupCol"]') && !avPanelElement.querySelector(".b3-text-field")) ||
            avPanelElement.querySelector('[data-type="addAssetExist"]')) {
            const menuElement = avPanelElement.querySelector(".b3-menu__items");
            if (event.key === "Enter") {
                const currentElement = menuElement.querySelector(".b3-menu__item--current");
                if (currentElement) {
                    const editElement = currentElement.querySelector('[data-type="editAssetItem"]');
                    const uploadElement = currentElement.querySelector(".b3-form__upload");
                    if (editElement) {
                        avPanelElement.dispatchEvent(new CustomEvent("click", {
                            detail: {
                                type: editElement.getAttribute("data-type"),
                                target: editElement
                            }
                        }));
                    } else if (uploadElement) {
                        uploadElement.dispatchEvent(new MouseEvent("click", {bubbles: true}));
                    } else {
                        avPanelElement.dispatchEvent(new CustomEvent("click", {
                            detail: {
                                type: currentElement.getAttribute("data-type"),
                                target: currentElement
                            }
                        }));
                    }
                    return true;
                }
            } else if (event.key === "Escape") {
                avPanelElement.dispatchEvent(new CustomEvent("click", {detail: "close"}));
                return true;
            } else if (upDownHint(menuElement, event, "b3-menu__item--current", menuElement.firstElementChild)){
                return true;
            }
        }
    }
    return false;
};
