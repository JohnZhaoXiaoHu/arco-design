import React, { useState, useContext, PropsWithChildren } from 'react';
import throttle from 'lodash/throttle';
import { ConfigContext } from '../ConfigProvider';
import ResizeObserverComponent from '../_util/resizeObserver';
import {
  TypographyParagraphProps,
  TypographyTitleProps,
  TypographyTextProps,
  EllipsisConfig,
} from './interface';
import Operations from './operations';
import cs from '../_util/classNames';
import EditContent from './edit-content';
import { isObject, isUndefined } from '../_util/is';
import Tooltip from '../Tooltip';
import Popover from '../Popover';
import omit from '../_util/omit';
import mergedToString from '../_util/mergedToString';
import useMergeValue from '../_util/hooks/useMergeValue';
import useEllipsis from './useEllipsis';

type BaseProps = PropsWithChildren<
  TypographyParagraphProps & TypographyTitleProps & TypographyTextProps
> & {
  componentType: 'Title' | 'Paragraph' | 'Text';
};

function getClassNameAndComponentName(props: BaseProps, prefixCls: string) {
  const { type, bold, disabled, mark, underline, delete: propDelete, code } = props;

  const component = [];
  const className = [];

  if (type) {
    className.push(`${prefixCls}-${type}`);
  }
  if (disabled) {
    className.push(`${prefixCls}-disabled`);
  }

  if (bold) {
    component.push('b');
  }
  if (underline) {
    component.push('u');
  }
  if (propDelete) {
    component.push('del');
  }
  if (code) {
    component.push('code');
  }
  if (mark) {
    component.push('mark');
  }

  return {
    component,
    className,
  };
}

function Base(props: BaseProps) {
  const {
    componentType,
    style,
    className,
    children,
    editable,
    ellipsis,
    heading,
    blockquote,
    copyable,
    ...rest
  } = props;
  const configContext = useContext(ConfigContext);
  const { getPrefixCls } = configContext;
  const prefixCls = getPrefixCls('typography');

  const { component, className: componentClassName } = getClassNameAndComponentName(
    props,
    prefixCls
  );

  const [editing, setEditing] = useState<boolean>(false);
  const [width, setWidth] = useState(0);
  const editableConfig = isObject(editable) ? editable : {};
  const mergedEditing = 'editing' in editableConfig ? editableConfig.editing : editing;

  const ellipsisConfig: EllipsisConfig = ellipsis
    ? { rows: 1, ellipsisStr: '...', cssEllipsis: true, ...(isObject(ellipsis) ? ellipsis : {}) }
    : {};

  const [expanding, setExpanding] = useMergeValue<boolean>(false, {
    defaultValue: ellipsisConfig.defaultExpanded,
    value: ellipsisConfig.expanded,
  });

  function canSimpleEllipsis() {
    const { rows, ellipsisStr, suffix, onEllipsis, expandable, cssEllipsis } = ellipsisConfig;
    if (!cssEllipsis) {
      return;
    }
    if (suffix || ellipsisStr !== '...') return;
    if (onEllipsis || expandable || onEllipsis) return;
    if (editable || copyable) return;
    return rows === 1;
  }
  const simpleEllipsis = canSimpleEllipsis();

  const renderMeasureContent = (node, isEllipsis) => {
    const ellipsisStr = !isUndefined(ellipsisConfig.ellipsisStr)
      ? ellipsisConfig.ellipsisStr
      : '...';
    const suffix = !isUndefined(ellipsisConfig.suffix) && ellipsisConfig.suffix;
    return (
      <>
        {node}
        {isEllipsis && !expanding && !simpleEllipsis ? ellipsisStr : ''}
        {suffix}
        {renderOperations(isEllipsis)}
      </>
    );
  };

  const { ellipsisNode, isEllipsis } = useEllipsis({
    ...ellipsisConfig,
    children,
    expanding,
    width,
    renderMeasureContent,
    simpleEllipsis: simpleEllipsis || expanding,
  });

  const handleResize = throttle((entry) => {
    const { contentRect } = entry?.[0];

    if (contentRect) {
      setWidth(contentRect.width);
    }
  }, 200);

  function renderOperations(isEllipsis?: boolean) {
    return (
      <>
        <Operations
          {...props}
          setEditing={setEditing}
          onClickExpand={onClickExpand}
          expanding={expanding}
          isEllipsis={isEllipsis}
          // 如果是镜像dom的话，渲染在最外层，无法从context中拿到最新config
          currentContext={configContext}
        />
      </>
    );
  }

  function onClickExpand(e) {
    setExpanding(!expanding);
    props.onClickExpand && props.onClickExpand(e);
    ellipsisConfig.onExpand && ellipsisConfig.onExpand(!expanding, e);
  }

  function wrap(content, component, props) {
    let currentContent = content;
    component.forEach((c) => {
      const _props =
        isObject(props.mark) && props.mark.color
          ? { style: { backgroundColor: props.mark.color } }
          : {};
      currentContent = React.createElement(c, { ..._props }, currentContent);
    });
    return currentContent;
  }

  function renderContent() {
    const fullText = mergedToString(React.Children.toArray(children));
    const showTooltip = ellipsisConfig.showTooltip;
    const tooltipType = isObject(ellipsisConfig.showTooltip)
      ? ellipsisConfig.showTooltip.type === 'popover'
        ? 'popover'
        : 'tooltip'
      : 'tooltip';
    const tooltipProps = isObject(ellipsisConfig.showTooltip)
      ? ellipsisConfig.showTooltip.props || {}
      : {};
    const TooltipComponent = (tooltipType === 'popover' ? Popover : Tooltip) as any;

    const titleProps = isEllipsis && !showTooltip && !expanding ? { title: fullText } : {};

    const baseProps = {
      style,
      ...titleProps,
    };

    const addTooltip = isEllipsis && showTooltip && !expanding;
    let TextComponent;
    if (componentType === 'Paragraph') {
      TextComponent = blockquote ? 'blockquote' : 'div';
    } else if (componentType === 'Title') {
      TextComponent = `h${heading}`;
    } else if (componentType === 'Text') {
      TextComponent = ellipsis ? 'div' : 'span';
    }

    const node = (
      <ResizeObserverComponent onResize={handleResize}>
        <TextComponent
          className={cs(
            prefixCls,
            { [`${prefixCls}-simple-ellipsis`]: simpleEllipsis && !expanding },
            componentClassName,
            className
          )}
          {...baseProps}
          {...omit(rest, [
            'spacing',
            'type',
            'close',
            'bold',
            'disabled',
            'mark',
            'underline',
            'delete',
            'code',
            'copyable',
            'isEllipsis',
            'expanding',
            'onClickExpand',
            'setEditing',
            'forceShowExpand',
          ])}
        >
          {wrap(ellipsisNode, component, props)}
        </TextComponent>
      </ResizeObserverComponent>
    );

    if (addTooltip) {
      return (
        <TooltipComponent content={fullText} {...tooltipProps}>
          <span>{node}</span>
        </TooltipComponent>
      );
    }

    return node;
  }

  return mergedEditing ? (
    <EditContent
      {...props}
      prefixCls={prefixCls}
      setEditing={setEditing}
      editableConfig={editableConfig}
    />
  ) : (
    renderContent()
  );
}

export default Base;
