import React from 'react';
import ReactDOM from 'react-dom';
import WithS3Client from './WithS3Client';
import Config from "../../components/Config/Config";
import {mount} from "enzyme";

const MockComponent = function(props) {
    let {property, s3} = props;

    let showText = property.reduce((acc, current) => acc[current], s3).toString();

    return (
        <React.Fragment>
            {showText}
        </React.Fragment>
    );
}

beforeAll(() => {
    Config.setConfig({
        "externalConfigurationFiles": []
    });

    return Config.init();
});

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<WithS3Client />, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('passes s3 client into all children', () => {
    const wrapper = mount(<WithS3Client><MockComponent property={['config', 'credentials', 'accessKeyId']}></MockComponent></WithS3Client>);
    expect(wrapper.text()).toEqual('not-needed');
});

it('sends credentials along with the API', () => {
    const wrapper = mount(<WithS3Client><MockComponent property={['config', 'httpOptions', 'xhrWithCredentials']}></MockComponent></WithS3Client>);
    expect(wrapper.text()).toEqual('true');
});

it('renders properly with text children', () => {
    const div = document.createElement('div');
    ReactDOM.render(<WithS3Client>test</WithS3Client>, div);

});
