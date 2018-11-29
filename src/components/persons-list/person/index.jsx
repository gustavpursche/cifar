import { graphql } from 'gatsby';
import Link from 'gatsby-link';
import React from 'react';

import createSlug from '../../../lib/create-slug';
import styles from './styles';

export default ({
  image,
  frontmatter: { sanctionsCountry: country, name, identifyingInformation: role }
}) => (
  <li className="person">
    <style jsx>{styles}</style>

    <Link to={`/persons/${createSlug(country)}/${createSlug(name)}/`}>
      <figure className={`image image--${image && 'has-file'}`}>
        {image && (
          <img
            src={image.node.fluid.src}
            srcSet={image.node.fluid.srcSet}
            alt={`Portrait of ${name}`}
          />
        )}
      </figure>

      <h2 className="title">
        {name}
        <small className="role">{role}</small>
      </h2>
    </Link>
  </li>
);

export const fragment = graphql`
  fragment personsList on MarkdownRemarkConnection {
    edges {
      node {
        frontmatter {
          id
          sanctionsCountry
          name
          identifyingInformation
          corruptionLink
          aliases
          nativeName
        }
      }
    }
  }
`;
