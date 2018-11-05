import * as d3 from 'd3';
import { navigate } from '@reach/router';
import createSlug from '../../lib/create-slug';

const createNodesAndLinks = person => {
  const nodes = [];
  const links = [];

  const storePerson = p => {
    const { network, ...rest } = p;

    nodes.push({ ...rest });
  };

  const storeLink = (target, source) => {
    links.push({
      target: target.name,
      source: source.name
    });
  };

  const interateNetwork = p => {
    storePerson(p);

    if (p.network) {
      p.network.forEach(_ => {
        interateNetwork(_);
        storeLink(_, p);
      });
    }
  };

  interateNetwork(person);

  return { nodes, links };
};

const appendImage = (svg, nodes) => {
  const size = 150;

  svg
    .append('defs')
    .append('pattern')
    .attr('id', 'image')
    .attr('x', -0.5 * size)
    .attr('y', -0.5 * size)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', size)
    .attr('height', size)
    .append('image')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', size)
    .attr('height', size)
    .attr('xlink:href', nodes.find(_ => _.root).image);
};

const drawPersons = (svg, nodes) => {
  const persons = svg
    .selectAll('.person')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'person')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('transform', ({ x, y }) => `translate(${x},${y})`)
    // eslint-disable-next-line no-alert
    .on('click', ({ country, name }) => {
      navigate(`/persons/${createSlug(country)}/${createSlug(name)}/`);
    });

  // add a background-circle on the root person (for a background-color)
  persons
    .filter(d => d.root)
    .append('circle')
    .attr('class', 'person-background-circle')
    .attr('r', d => (d.root ? 70 : 10));

  persons
    .append('circle')
    .attr(
      'class',
      d => `person-circle ${d.root ? 'person-circle--is-root' : ''}`
    )
    .attr('r', d => (d.root ? 70 : 10));

  const info = persons
    .append('g')
    .attr(
      'class',
      ({ root }) => `person-info ${root ? 'person-info--for-root' : ''}`
    );

  // name
  info
    .append('text')
    .text(d => d.name)
    .attr('class', 'person-name');

  // role
  info
    .append('text')
    .text(d => d.role)
    .attr('class', 'person-role')
    .attr('y', 13);

  return persons;
};

const drawConnections = (svg, links) => {
  const connections = svg
    .selectAll('.connection')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'connection')
    .attr('class', d => `connection connection--${d.target.connection}`)
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  return connections;
};

const render = (root, data) => {
  root.innerHTML = '';

  const svg = d3.select(root).append('svg');
  const { height, width } = root.getBoundingClientRect();
  const nodesById = d3.map();
  const { nodes, links } = createNodesAndLinks(data[0]);

  // setup links by name
  nodes.forEach(_ => nodesById.set(_.name, _));
  links.forEach(_ => {
    _.source = nodesById.get(_.source);
    _.target = nodesById.get(_.target);
  });

  svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  appendImage(svg, nodes);

  const simulation = d3
    .forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide().radius(d => (d.root ? 80 : 55)))
    .force('link', d3.forceLink())
    .stop();

  simulation
    .force('link')
    .links(links)
    .distance(10);

  for (let i = 0; i < 300; ++i) {
    simulation.tick();
  }

  drawConnections(svg, links);
  drawPersons(svg, nodes);

  return svg;
};

export default render;
