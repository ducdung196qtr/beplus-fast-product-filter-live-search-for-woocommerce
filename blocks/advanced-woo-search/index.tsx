import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import metadata from './block.json';
import type { BlockAttributes } from './types';
import './types';

registerBlockType( metadata as unknown as BlockConfiguration< BlockAttributes >, {
	edit: Edit,
	save: () => null,
} );
