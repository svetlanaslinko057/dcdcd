/**
 * Knowledge Graph Controller - API Routes
 */

import { Controller, Get, Post, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { GraphQueryService } from './query.service';
import { GraphBuilderService } from './builder.service';
import { NODE_TYPES } from './models';

@Controller('graph')
export class KnowledgeGraphController {
  constructor(
    private readonly queryService: GraphQueryService,
    private readonly builderService: GraphBuilderService,
  ) {}

  // Health endpoint
  @Get('health')
  async getHealth() {
    try {
      const stats = await this.queryService.getStats();
      return {
        status: 'healthy',
        metrics: {
          nodes_count: stats.total_nodes,
          edges_count: stats.total_edges,
          avg_degree: stats.total_nodes > 0 
            ? Math.round(stats.total_edges / stats.total_nodes * 2 * 100) / 100 
            : 0,
        },
        distribution: {
          node_types: stats.nodes_by_type,
          edge_types: stats.edges_by_type,
        },
      };
    } catch (e: any) {
      return { status: 'error', error: e.message };
    }
  }

  // Network endpoints (for visualization)
  @Get('network')
  async getNetwork(
    @Query('center_type') centerType?: string,
    @Query('center_id') centerId?: string,
    @Query('depth') depth: string = '1',
    @Query('limit_nodes') limitNodes: string = '200',
    @Query('limit_edges') limitEdges: string = '500',
    @Query('node_types') nodeTypes?: string,
    @Query('relation_types') relationTypes?: string,
    @Query('scopes') scopes?: string,
  ) {
    const nodeTypesList = nodeTypes?.split(',');
    const relationTypesList = relationTypes?.split(',');
    const scopesList = scopes?.split(',').map(s => s.trim());

    const result = await this.queryService.getNetwork(
      centerType,
      centerId,
      parseInt(depth, 10),
      parseInt(limitNodes, 10),
      parseInt(limitEdges, 10),
      nodeTypesList,
      relationTypesList,
    );

    // Filter by scopes if specified
    if (scopesList && scopesList.length > 0) {
      result.edges = result.edges.filter((e: any) => scopesList.includes(e.scope));
      result.stats.filtered_by_scopes = scopesList;
      result.stats.edge_count = result.edges.length;
    }

    return result;
  }

  @Get('network/:entityType/:entityId')
  async getEntityNetwork(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('depth') depth: string = '1',
    @Query('limit_nodes') limitNodes: string = '100',
    @Query('limit_edges') limitEdges: string = '300',
    @Query('scopes') scopes?: string,
  ) {
    const scopesList = scopes?.split(',').map(s => s.trim());

    const result = await this.queryService.getNetwork(
      entityType,
      entityId,
      parseInt(depth, 10),
      parseInt(limitNodes, 10),
      parseInt(limitEdges, 10),
    );

    if (scopesList && scopesList.length > 0) {
      result.edges = result.edges.filter((e: any) => scopesList.includes(e.scope));
      result.stats.filtered_by_scopes = scopesList;
    }

    return result;
  }

  // Node endpoints
  @Get('node/:entityType/:entityId')
  async getNode(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const node = await this.queryService.getNode(entityType, entityId);
    if (!node) {
      throw new HttpException(`Node not found: ${entityType}:${entityId}`, HttpStatus.NOT_FOUND);
    }

    return {
      id: `${node.entity_type}:${node.entity_id}`,
      entity_type: node.entity_type,
      entity_id: node.entity_id,
      label: node.label,
      slug: node.slug,
      status: node.status,
      metadata: node.metadata || {},
      edge_count: node.edge_count || 0,
      created_at: node.created_at,
      updated_at: node.updated_at,
    };
  }

  @Get('edges/:entityType/:entityId')
  async getEdges(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('relation_type') relationType?: string,
    @Query('direction') direction: string = 'both',
    @Query('limit') limit: string = '100',
  ) {
    const edges = await this.queryService.getEdges(
      entityType,
      entityId,
      relationType,
      direction,
      parseInt(limit, 10),
    );

    // Fetch node labels for edges
    const result = [];
    for (const edge of edges) {
      const fromNode = await this.queryService.getNodeById(edge.from_node_id);
      const toNode = await this.queryService.getNodeById(edge.to_node_id);

      result.push({
        id: edge.id,
        source: fromNode ? `${fromNode.entity_type}:${fromNode.entity_id}` : edge.from_node_id,
        source_label: fromNode?.label,
        target: toNode ? `${toNode.entity_type}:${toNode.entity_id}` : edge.to_node_id,
        target_label: toNode?.label,
        relation: edge.relation_type,
        weight: edge.weight || 1.0,
        source_type: edge.source_type || 'direct',
        metadata: edge.metadata || {},
      });
    }

    return { edges: result, total: result.length };
  }

  @Get('neighbors/:entityType/:entityId')
  async getNeighbors(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('neighbor_type') neighborType?: string,
    @Query('relation_type') relationType?: string,
    @Query('limit') limit: string = '50',
  ) {
    const neighbors = await this.queryService.getNeighbors(
      entityType,
      entityId,
      neighborType,
      relationType,
      parseInt(limit, 10),
    );

    const result = neighbors.map(node => ({
      id: `${node.entity_type}:${node.entity_id}`,
      label: node.label,
      type: node.entity_type,
      entity_id: node.entity_id,
      slug: node.slug,
      metadata: node.metadata || {},
    }));

    return { neighbors: result, total: result.length };
  }

  // Search & Discovery
  @Get('search')
  async searchNodes(
    @Query('q') query: string,
    @Query('entity_type') entityType?: string,
    @Query('limit') limit: string = '20',
  ) {
    if (!query) {
      throw new HttpException('Query parameter q is required', HttpStatus.BAD_REQUEST);
    }

    const results = await this.queryService.search(query, entityType, parseInt(limit, 10));
    return { results, total: results.length, query };
  }

  @Get('related/:entityType/:entityId')
  async getRelated(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('limit') limit: string = '10',
  ) {
    const related = await this.queryService.getRelated(
      entityType,
      entityId,
      parseInt(limit, 10),
    );
    return { related, total: related.length };
  }

  // Stats & Admin
  @Get('stats')
  async getStats() {
    return this.queryService.getStats();
  }

  @Get('node-types')
  async getNodeTypes() {
    return { node_types: NODE_TYPES };
  }

  @Post('rebuild')
  async rebuildGraph() {
    try {
      const snapshot = await this.builderService.fullRebuild();
      return {
        status: 'success',
        snapshot_id: snapshot.id,
        node_count: snapshot.node_count,
        edge_count: snapshot.edge_count,
        created_at: snapshot.created_at.toISOString(),
      };
    } catch (e: any) {
      throw new HttpException(`Rebuild failed: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
