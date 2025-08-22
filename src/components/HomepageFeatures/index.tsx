// src/components/HomepageFeatures/index.tsx
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: React.ReactElement;
  link: string;       // ← add a link per feature
  external?: boolean; // ← optional: mark external links
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Docs',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: <>Read all documentation, guides, and references.</>,
    link: '/docs/intro',
  },
  {
    title: 'Blog',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: <>Latest news, tips, and release notes.</>,
    link: '/blog',
  },
  {
    title: 'WiLL Website',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: <>Visit our main site for brand and product info.</>,
    link: 'https://willbrands.com',
    external: true,
  },
];

function Feature({title, Svg, description, link, external}: FeatureItem) {
  // Use `to` for internal links, `href` for external so Docusaurus handles them correctly.
  const linkProps = external ? {href: link} : {to: link};

  return (
    <div className={clsx('col col--4')}>
      <Link
        {...linkProps}
        className={clsx('card', styles.cardLink)}
        aria-label={title}
      >
        <div className="card__image">
          <Svg role="img" className={styles.featureSvg} />
        </div>
        <div className="card__body">
          <h3 className={styles.featureTitle}>{title}</h3>
          <p className={styles.featureDesc}>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): React.ReactElement {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
