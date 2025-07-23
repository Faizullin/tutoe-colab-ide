
/* ----------- async-select.jsx ----------- */
import * as React from 'react';
import Async from 'react-select/async';
import {
    ClearIndicator,
    DropdownIndicator,
    MultiValueRemove,
    Option
} from './components';
import { defaultClassNames, defaultStyles } from './helper';
import { AsyncProps } from 'react-select/async';
import { GroupBase } from 'react-select';

const AsyncSelect = React.forwardRef(<Option, IsMulti extends boolean, Group extends GroupBase<Option>>(props: AsyncProps<Option, IsMulti, Group>, ref: any) => {
    const {
        value,
        onChange,
        styles = defaultStyles,
        classNames = defaultClassNames,
        components = {},
        ...rest
    } = props;

    return (
        <Async
            ref={ref as any}
            value={value}
            onChange={onChange}
            unstyled
            components={{
                DropdownIndicator,
                ClearIndicator,
                MultiValueRemove,
                Option,
                ...components
            }}
            styles={styles}
            classNames={classNames}
            {...rest}
        />
    );
});
export default AsyncSelect;
AsyncSelect.displayName = 'AsyncSelect';
