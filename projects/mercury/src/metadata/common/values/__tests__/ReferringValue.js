import React from 'react';

import {ReferringValue} from "../ReferringValue";
import LinkedDataLink from "../../LinkedDataLink";

describe('ReferringValue', () => {
    it('should render an external link directly', () => {
        const property = {
            isGenericIriResource: true,
            isExternalLink: true
        };
        const entry = {
            id: 'https://thehyve.nl'
        };
        expect(ReferringValue({
            property, entry
        })).toEqual(<a href="https://thehyve.nl">https://thehyve.nl</a>);
    });

    it('should render a generic iri resource as link to editor', () => {
        const property = {
            isGenericIriResource: true,
            isExternalLink: false
        };
        const entry = {
            id: 'https://thehyve.nl'
        };

        expect(ReferringValue({
            property, entry
        })).toEqual(<LinkedDataLink uri="https://thehyve.nl">https://thehyve.nl</LinkedDataLink>);
    });

    it('should render a regular links with the label of the resource', () => {
        const property = {};
        const entry = {
            id: 'https://my-resource',
            label: 'My resource'
        };

        expect(ReferringValue({
            property, entry
        })).toEqual(<LinkedDataLink uri="https://my-resource">My resource</LinkedDataLink>);
    });

    it('should render a values without URI as its label', () => {
        const property = {};
        const entry = {
            label: 'My resource'
        };

        expect(ReferringValue({
            property, entry
        })).toEqual('My resource');
    });
});
