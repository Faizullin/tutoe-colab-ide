/* ----------- simple-select.js ----------- */
import { forwardRef } from 'react';
import type { Props } from 'react-select';
import Select from 'react-select';
import {
  ClearIndicator,
  DropdownIndicator,
  MultiValueRemove,
  Option
} from './components';
import { defaultClassNames, defaultStyles } from './helper';

const SimpleSelect = forwardRef((props: Props, ref) => {
  const {
    value,
    onChange,
    options = [],
    styles = defaultStyles,
    classNames = defaultClassNames,
    components = {},
    ...rest
  } = props;

  return (
    <Select
      ref={ref}
      value={value}
      onChange={onChange}
      options={options}
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
export default SimpleSelect;

SimpleSelect.displayName = 'SimpleSelect';


