import GameObject from './gameobject.js';
import Constants from './constants.js';
import * as _ from 'lodash';

export class Tile extends GameObject {
    passable = true;
    zindex = -10;
    tileSize = { height: Constants.tileSize, width: Constants.tileSize };

    constructor(room, x = null, y = null, sourcePos = null, zindex = null) {
        super(room.game);
        this.room = room;
        this.decorations = [];

        if (x !== null && y !== null)
            this.pos = { x, y };

        if (sourcePos !== null)
            this.sourcePos = sourcePos;

        if (zindex !== null)
            this.zindex = zindex;
    }

    destroy() {
        super.destroy();

        for (let obj of this.decorations)
            obj.destroy();
    }

    // called after the whole room is created
    init(x, y) {
        this.pos = { x, y };
    }

    get BBox() {
        return {
            x: this.pos.x * Constants.tileSize,
            y: this.pos.y * Constants.tileSize,
            width: Constants.tileSize,
            height: Constants.tileSize,
        }
    }

    render(ctx) {
        // check that the tileset is loaded
        if (!Constants.tileset.complete)
            return;

        ctx.drawImage(
            Constants.tileset,
            this.sourcePos.x * Constants.tileSize, // source BBox
            this.sourcePos.y * Constants.tileSize,
            this.tileSize.width,
            this.tileSize.height,
            this.pos.x * Constants.tileSize, // target BBox
            this.pos.y * Constants.tileSize,
            this.tileSize.width,
            this.tileSize.height,
        )
    }
}

export class FloorTile extends Tile {
    sourcePos = { x: 2, y: 3 }; // basic floor

    init(x, y) {
        super.init(x, y);

        // add random shadow if floor next to a wall
        if (this.room.getTile(x, y - 1) instanceof WallTile)
            this.sourcePos = { x: _.random(0, 2), y: 2 };

        // add randomly skull on the ground
        if (_.random(100) == 0) {
            this.decorations.push(new Tile(this.room, this.pos.x, this.pos.y, { x: 1, y: 3 }, -8));            
        }
    }
}

export class WallTile extends Tile {
    passable = false;
    sourcePos = { x: 1, y: 1 }; // basic wall
    zindex = 5;

    init(x, y) {
        super.init(x, y);

        // bottom wall
        if (!(this.room.getTile(x, y + 1) instanceof FloorTile) &&
            this.room.getTile(this.pos.x, this.pos.y - 1) instanceof FloorTile) {
            this.sourcePos = [
                { x: 8, y: 0 },
                { x: 7, y: 1 },
                { x: 8, y: 1 },
            ][_.random(2)];
            return;
        }

        // side wall
        if (!(this.room.getTile(this.pos.x, this.pos.y + 1) instanceof FloorTile)) {
            this.sourcePos = { x: 4, y: 6 };
            return;
        }

        // top left wall
        if (this.room.getTile(x - 2, y) === null && this.room.getTile(x - 1, y + 1) instanceof WallTile) {
            this.sourcePos = { x: 0, y: 1 };
            this.decorations.push(new Tile(this.room, this.pos.x, this.pos.y - 1, { x: 0, y: 0 }, 6));
            return;
        }

        // top right wall
        if (this.room.getTile(x + 2, y) === null && this.room.getTile(x + 1, y + 1) instanceof WallTile) {
            this.sourcePos = { x: 2, y: 1 };
            this.decorations.push(new Tile(this.room, this.pos.x, this.pos.y - 1, { x: 2, y: 0 }, 6));
            return;
        }

        this.decorations.push(new Tile(this.room, this.pos.x, this.pos.y - 1, { x: 1, y: 0 }, 6));

        // random types of walls for variety
        switch (_.random(30)) {
            case 0:
            case 1:
            case 2:
                this.sourcePos = { x: 4, y: 2 }; // broken brick
                return;
            case 3:
                this.sourcePos = { x: 12, y: 4 }; // red flag
                return;
            case 4:
                this.sourcePos = { x: 4, y: 0 }; // pipe
        }
    }
}

export class ExitTile extends FloorTile {
    passable = false;
    
    init(x, y) {
        super.init(x, y);

        // add exit shadows
        // left
        if (this.room.getTile(x - 1, y) === null) {
            this.decorations.push(new Tile(this.room, this.pos.x, this.pos.y, { x: 10, y: _.random(7, 8) }, -5));
            this.decorations.push(new Tile(this.room, this.pos.x + 1, this.pos.y, { x: 11, y: _.random(7, 8) }, -5));
        }

        // right
        if (this.room.getTile(x + 1, y) === null) {
            this.decorations.push(new Tile(this.room, this.pos.x, this.pos.y, { x: 13, y: _.random(7, 8) }, -5));
            this.decorations.push(new Tile(this.room, this.pos.x - 1, this.pos.y, { x: 12, y: _.random(7, 8) }, -5));
        }

        // top
        if (this.room.getTile(x, y - 1) === null) {
            this.decorations.push(new Tile(this.room, this.pos.x, this.pos.y, { x: _.random(8, 9), y: 7 }, -5));
            this.decorations.push(new Tile(this.room, this.pos.x, this.pos.y + 1, { x: _.random(8, 9), y: 8 }, -5));
        }

        // bottom
        if (this.room.getTile(x, y + 1) === null) {
            this.decorations.push(new Tile(this.room, this.pos.x, this.pos.y, { x: _.random(14, 15), y: 8 }, -5));
            this.decorations.push(new Tile(this.room, this.pos.x, this.pos.y - 1, { x: _.random(14, 15), y: 7 }, -5));
        }
    }
}