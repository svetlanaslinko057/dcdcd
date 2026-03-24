/**
 * Knowledge Graph Module
 */

import { Module } from '@nestjs/common';
import { MongooseModule, Schema as MongooseSchema } from '@nestjs/mongoose';
import { Schema } from 'mongoose';
import { KnowledgeGraphController } from './knowledge-graph.controller';
import { GraphResolverService } from './resolver.service';
import { GraphBuilderService } from './builder.service';
import { GraphQueryService } from './query.service';

// Flexible schemas for graph collections
const GraphNodeSchema = new Schema({}, { strict: false, timestamps: true });
const GraphEdgeSchema = new Schema({}, { strict: false, timestamps: true });
const GraphEdgeTypeSchema = new Schema({}, { strict: false, timestamps: true });
const GraphSnapshotSchema = new Schema({}, { strict: false, timestamps: true });
const IntelProjectSchema = new Schema({}, { strict: false, timestamps: true });

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'GraphNode', schema: GraphNodeSchema, collection: 'graph_nodes' },
      { name: 'GraphEdge', schema: GraphEdgeSchema, collection: 'graph_edges' },
      { name: 'GraphEdgeType', schema: GraphEdgeTypeSchema, collection: 'graph_edge_types' },
      { name: 'GraphSnapshot', schema: GraphSnapshotSchema, collection: 'graph_snapshots' },
      { name: 'IntelProject', schema: IntelProjectSchema, collection: 'intel_projects' },
    ]),
  ],
  controllers: [KnowledgeGraphController],
  providers: [GraphResolverService, GraphBuilderService, GraphQueryService],
  exports: [GraphResolverService, GraphBuilderService, GraphQueryService],
})
export class KnowledgeGraphModule {}
