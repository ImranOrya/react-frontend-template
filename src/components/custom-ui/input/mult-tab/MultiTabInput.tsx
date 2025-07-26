import React, { type ReactElement } from "react";
import type { ReactNode } from "react";
import SingleTab from "./parts/SingleTab";
import OptionalTab from "./parts/OptionalTab";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface MultiTabInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  children:
    | ReactElement<typeof SingleTab | typeof OptionalTab>
    | ReactElement<typeof SingleTab | typeof OptionalTab>[];
  userData: any;
  errorData?: Map<string, string>;
  onTabChanged: (key: string, data: string) => void;
  onChanged: (value: string, name: string) => void;
  highlightColor: string;
  placeholder?: string;
  tabsClassName?: string;
  parentClassName?: string;
  title?: string;
  name: string;
  optionalKey: string;
}

const MultiTabInput = React.forwardRef<HTMLInputElement, MultiTabInputProps>(
  (props, ref: any) => {
    const {
      className,
      name,
      optionalKey,
      tabsClassName,
      parentClassName,
      children,
      type,
      userData,
      errorData,
      onTabChanged,
      onChanged,
      highlightColor,
      placeholder,
      title,
      ...rest
    } = props;

    const selectionName = `${name}_selections`;
    let selectedTab: string = userData[optionalKey];

    const tabChanged = (tabName: string) => {
      onTabChanged(selectionName, tabName);
    };

    const inputOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, name } = e.target;
      onChanged(value, name);
    };

    const processTabs = (children: ReactNode) => {
      let selectedTabName = "";
      const errorMessages: string[] = [];

      const elements = React.Children.map(children, (child, mainIndex) => {
        if (React.isValidElement(child)) {
          // Cast here to fix TS error on child.props
          const element = child as React.ReactElement<any>;
          const levelOneChildren = element.props.children;

          if (element.type === SingleTab) {
            const selectItemText = generateUniqueName(name, levelOneChildren);
            if (mainIndex === 0 && !selectedTab) {
              selectedTab = levelOneChildren;
            }

            let classNameOne = element.props.className;
            let newColor = "";
            const err = errorData?.get(selectItemText);
            if (err) {
              errorMessages.push(err);
              newColor += " bg-red-500 ";
            } else {
              newColor =
                selectedTab === levelOneChildren
                  ? ` ${highlightColor}`
                  : mainIndex === 0 && !selectedTab
                  ? ` ${highlightColor}`
                  : "";
            }

            if (classNameOne) {
              classNameOne += newColor;
            } else {
              classNameOne = newColor;
            }

            return React.cloneElement(element, {
              className: classNameOne,
              onClick: () => tabChanged(levelOneChildren),
            });
          } else if (element.type === OptionalTab) {
            if (Array.isArray(levelOneChildren)) {
              if (mainIndex == 0 && !selectedTab) {
                selectedTab = levelOneChildren[0].props.children;
              }
              return (
                <div className="flex gap-1" key={`optional-tab-${mainIndex}`}>
                  {React.Children.map(levelOneChildren, (childInner, index) => {
                    if (!React.isValidElement(childInner)) return null;
                    const innerElement = childInner as React.ReactElement<any>;
                    const levelTwoChildren = innerElement.props.children;
                    let classNameOne = innerElement.props.className;
                    let newColor = "";
                    const err = errorData?.get(selectedTabName);

                    if (err) {
                      errorMessages.push(err);
                      newColor += " bg-red-500 ";
                    } else {
                      newColor =
                        selectedTab === levelTwoChildren
                          ? ` ${highlightColor}`
                          : mainIndex === 0 && !selectedTab
                          ? ` ${highlightColor}`
                          : "";
                    }
                    if (classNameOne) {
                      classNameOne += newColor;
                    } else {
                      classNameOne = newColor;
                    }
                    return (
                      <React.Fragment key={`optional-tab-inner-${index}`}>
                        {React.cloneElement(innerElement, {
                          className: classNameOne,
                          onClick: () => tabChanged(levelTwoChildren),
                        })}
                        {index % 2 === 0 && (
                          <div className="font-semibold text-[18px] text-primary/80">
                            │
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }
          }
        }
        return null;
      });

      selectedTabName = generateUniqueName(name, selectedTab);
      const selectTabValue = userData[selectedTabName];
      return { elements, selectTabValue, selectedTabName, errorMessages };
    };

    const { elements, selectTabValue, selectedTabName, errorMessages } =
      processTabs(children);

    return (
      <div className={cn(`flex flex-col select-none`, parentClassName)}>
        {/* Title */}
        <h1 className="ltr:text-2xl-ltr rtl:text-xl-rtl text-start">{title}</h1>
        {/* Header */}
        <div className={cn("flex gap-x-4", tabsClassName)}>{elements}</div>
        {/* Body */}
        <Input
          type={type}
          {...rest}
          ref={ref}
          name={selectedTabName}
          key={selectedTab}
          placeholder={placeholder}
          onChange={inputOnchange}
          defaultValue={selectTabValue}
          style={{
            height: "50px",
          }}
          className={cn(
            `focus-visible:ring-0 mt-2 bg-card dark:!bg-black/30 focus-visible:border-primary/30 focus-visible:ring-offset-0 rtl:pr-[12px] ltr:ps-[12px] ${
              className ?? ""
            } ${
              errorMessages.length > 0 ? "border-red-400 !border-b border" : ""
            } ${props.readOnly ? "cursor-not-allowed" : ""}`
          )}
        />
        {errorMessages.map((error: string, index: number) => (
          <h1
            key={index}
            className="rtl:text-md-rtl ltr:text-sm-ltr px-2 capitalize text-start text-red-400"
          >
            {error}
          </h1>
        ))}
      </div>
    );
  }
);

export default MultiTabInput;

const generateUniqueName = (name: string, transName: string) =>
  `${name}_${transName}`;
