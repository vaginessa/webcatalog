import { remote, shell, ipcRenderer } from 'electron';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu, MenuItem, Popover, Button, Position, Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import { replace, push, goBack } from 'react-router-redux';

import { refresh } from '../actions/home';
import { search, setSearchQuery } from '../actions/search';

const Nav = ({
  query, pathname,
  requestSearch, requestSetSearchQuery, requestRefresh,
  goTo,
}) => (
  <nav
    className="pt-navbar"
    style={{
      display: 'flex',
      WebkitUserSelect: 'none',
      WebkitAppRegion: 'drag',
      flexBasis: 50,
      paddingLeft: (remote.require('os').platform() === 'darwin') ? 80 : null,
    }}
  >
    <div className="pt-navbar-group pt-align-left" style={{ flex: 1, paddingRight: 12 }}>
      <div className="pt-input-group" style={{ width: '100%', maxWidth: 300 }}>
        <span className="pt-icon pt-icon-search" />
        <input
          className="pt-input"
          placeholder="Search (name, URL)..."
          type="text"
          style={{ width: '100%', WebkitUserSelect: 'text', WebkitAppRegion: 'no-drag' }}
          value={query}
          onKeyDown={(e) => {
            if ((e.keyCode || e.which) === 13) {
              requestSearch();
              e.target.blur();
            }
          }}
          onChange={e => requestSetSearchQuery(e.target.value, pathname)}
        />
        {query.length > 0 ? (
          <Button
            iconName="cross"
            className={Classes.MINIMAL}
            style={{ WebkitAppRegion: 'no-drag' }}
            onClick={() => requestSetSearchQuery('', pathname)}
          />
        ) : null}
      </div>
    </div>
    <div className="pt-navbar-group pt-align-right">
      <Button
        iconName="home"
        className={classNames(
          { [Classes.ACTIVE]: (pathname === '/') },
          Classes.MINIMAL,
        )}
        style={{ WebkitAppRegion: 'no-drag' }}
        text="Home"
        onClick={() => goTo('/')}
      />
      <Button
        iconName="import"
        className={classNames(
          { [Classes.ACTIVE]: (pathname === '/installed') },
          Classes.MINIMAL,
        )}
        style={{ WebkitAppRegion: 'no-drag' }}
        text="Installed"
        onClick={() => goTo('/installed')}
      />
      <Popover
        content={(
          <Menu>
            <MenuItem
              iconName="refresh"
              text="Refresh"
              onClick={() => requestRefresh(pathname)}
            />
            <MenuItem
              iconName="add"
              text="Submit new app"
              onClick={() => shell.openExternal('https://goo.gl/forms/QIFncw8dauDn61Mw1')}
            />
            <MenuItem
              iconName="help"
              text="Help"
              onClick={() => shell.openExternal('https://getwebcatalog.com/support')}
            />
            <MenuItem
              iconName="info-sign"
              text="About"
              onClick={() => {
                ipcRenderer.send('show-about-window');
              }}
            />
          </Menu>
        )}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          iconName="more"
          className={Classes.MINIMAL}
          style={{ WebkitAppRegion: 'no-drag' }}
        />
      </Popover>
    </div>
  </nav>
);

Nav.propTypes = {
  query: PropTypes.string.isRequired,
  pathname: PropTypes.string.isRequired,
  requestSearch: PropTypes.func.isRequired,
  requestSetSearchQuery: PropTypes.func.isRequired,
  requestRefresh: PropTypes.func.isRequired,
  goTo: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  query: state.search.get('query'),
  pathname: ownProps.pathname,
});

const mapDispatchToProps = dispatch => ({
  requestSearch: () => {
    dispatch(search());
    dispatch(push('/search'));
  },
  requestSetSearchQuery: (query, pathname) => {
    if (pathname === '/search') {
      dispatch(goBack());
    }
    dispatch(setSearchQuery(query));
  },
  requestRefresh: (pathname) => {
    dispatch(refresh(pathname));
  },
  goTo: (pathname) => {
    dispatch(replace(pathname));
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Nav);
