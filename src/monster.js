import Constants from './constants.js';
import GameObject from './gameobject.js';
import Vector from './lib/vector2d.js';
import Particle from './particle.js';

export default class Monster extends GameObject {
	zindex = 9;

	constructor(game, x, y) {
		super(game);
		this.pos = new Vector(x, y);
		this.speed = new Vector(0, 0);
		this.knockBack = 1;
		this.invincible = 1;
		this.timer = 1000;		
	}
	
	setTilePosition(xtile,ytile){
		this.xTile = xtile;
		this.yTile = ytile;
	}

	update(delta){
		if(this.invincible < 0){
			this.invincible = 0;
		}
		if(this.invincible > 0){
			this.invincible-=delta/300;
		}
	}

	inTileCollision() {
		var xx = Math.floor(this.pos.x / Constants.tileSize);
		var yy = Math.floor(this.pos.y / Constants.tileSize);

		// prioritize non-diagonal tiles
		for (let offset of [[0, 0], [-1, 0], [0, 1], [1, 0], [0, -1], [-1, 1], [-1, -1], [1, -1], [1, 1]]) {
			let tile = this.game.room.getTile(xx + offset[0], yy + offset[1]);
			if (tile === null)
				continue;

			var col = this.collides(tile);
			if (!tile.passable && col !== null) {
				// tile.debugDrawBBox(this.game.ctx);
				// var now = new Date().getTime();
				// while(new Date().getTime() < now + 500){ /* do nothing */ } 
				return col;
			}
		}

		return null;
	}

	onDeath() {
		for (let i = 0; i < 20; i++) {
			new Particle(this.game, this.pos, {x: (Math.random() - 0.5) * 10 + this.game.player.velocity.x, y: -Math.random() * 10 + this.game.player.velocity.y},
				{x: 0, y: 0.3}, '#800');
		}
		this.destroy();
	}
}