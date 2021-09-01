// library source and docs at https://github.com/Qix-/color
import  Color  from 'color'

// a simple implementation of a circular buffer for holding 
// a fixed size set of points in PointSet
import * as ps from './pointset';

// simple convenience 
function randomColor() {
    return Color({
        r: Math.random() * 255, 
        g: Math.random() * 255, 
        b: Math.random() * 255
    })
}

// yes, it's one line, but it's one less thing for you to figure out
function darken(color: Color) {
    return color.darken(0.25)   // creates a new color
}

// an interface that describes what our Rectangle object might look like.  
// Remember, a Typescript interface is just a description of the required
// properties (and methods, although we don't use methods here) an object
// must implement.  It is not a class or an object itself.
interface Rectangle {
    p1: ps.MousePosition;
    p2: ps.MousePosition;
    color: Color;
}
interface triangleStructure {
    color: Color | null
    corner1: number
    corner2: number
    corner3: number
    corner4: number
    rec: number
}


// A class for our application state and functionality
class Drawing {
    // the constructor paramater "canv" is automatically created 
    // as a property because the parameter is marked "public" in the 
    // constructor parameter
    //    canv: HTMLCanvasElement
    //
    // rendering context for the canvas, also public
    //    ctx: CanvasRenderingContext2D

    // some suggested properties you might use in your implementation
    mousePosition: ps.MousePosition | null = null;
    clickStart: ps.MousePosition | null = null;
    rects: Array <Rectangle>;   // an array that only contains objects that
                                // satisfy the Rectangle interface
    points: ps.PointSet;
    rectColor = new Color("blue")
    alphaVal = 0
    colurfill = "rgba(0, 0, 255, [[opacity]])";
    clickEnd: ps.MousePosition | null = null;
    m: ps.MousePosition | null = null
    n: ps.MousePosition | null = null
    randCol: Color | null = null
    triangleStructure: triangleStructure[] = []
    // a simple wrapper to reliably get the offset within an DOM element
    // We need this because the mouse position in the mouse event is
    // relative to the Window, but we want to specify draw coordinates
    // relative to the canvas DOM element  
    // see: http://www.jacklmoore.com/notes/mouse-position/
    static offset(e: MouseEvent): ps.MousePosition {
        e = e || <MouseEvent> window.event;

        var target = <Element> (e.target || e.srcElement),
            rect = target.getBoundingClientRect(),
            offsetX = e.clientX - rect.left,
            offsetY = e.clientY - rect.top;

        return {x: offsetX, y: offsetY};
    }

    // Web pages are reactive; Javascript is single threaded, and all 
    // javascript code in your page is executed in response to 
    // some action.   Actions include
    // - by the user (various callbacks like mouse and keyboard callback)
    // - by timers (we can use a timeout function to execute something in
    //   the future)
    // - things like network actions (e.g., fetch this resource, call this
    //   code when it's been retrieved)
    // - a callback synchronized with the next display refresh rate 
    //   that was created for doing animation
    // 
    // We use the this last one, triggered by a call to 
    //      requestAnimationFrame(() => this.render());
    // to do continuous rendering.  The requestAnimationFrame has one
    // parameter, a function.  The "() => this.render()" syntax is a 
    // shorthand for writing inline functions.  It says "this is a function
    // with no parameters" ("() =>") whose body is one line of code, the 
    // "this.render()" call.  It could also be
    //              requestAnimationFrame(() => {
    //                   this.render()
    //                });
    // where the function body is betwee {} and we could write more methods.

    render() {
        // Store the current drawing transformation matrix (and other state)
        this.ctx.save();
        
        // Use the identity matrix while clearing the canvas (just in case you change it someday!)
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = "lightgrey";
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
        
        // Restore the transform
        this.ctx.restore();        

        // **** TODO *****
        // if the mouse is over the canvas, it's position is here, otherwise it's null
        // add code to deal with the mouse position each render frame
        if (this.mousePosition) {
            this.ctx.fillStyle = this.rectColor.string();
            const m = this.mousePosition
            this.ctx.fillRect(m.x, m.y, 4, 4);
        // add code to draw rectangles we have so far at the back
            if (this.points.length < 30) {
                this.points.addPoint(this.mousePosition)
            } else {
                this.points.dropPoint()
                this.points.addPoint(this.mousePosition)
                for (let i = 0; i < 30; i++) {
        // add code to draw points with the oldest ones more transparent 
                    this.alphaVal = i / 50
                    this.ctx.fillStyle = this.colurfill.replace("[[opacity]]", this.alphaVal.toString());
                    this.ctx.fillRect(this.points.getPoint(i).x, this.points.getPoint(i).y, 4, 4);
                }
            }
        } else {
        }


        function recurseTriangleUp(ax: number, ay: number, bx: number, by: number, cx: number, color: Color, count: number, ctx: CanvasRenderingContext2D): void{
            ctx.beginPath()
            ctx.moveTo((ax + bx) / 2, (ay + by) / 2)
            ctx.lineTo((ax + cx) / 2, (ay + by) / 2)
            ctx.lineTo((bx + cx) / 2, by)
            ctx.lineTo((ax + bx) / 2, (ay + by) / 2)
            if (color) {
                ctx.fillStyle = "" + (color)
                ctx.fill()
                ctx.strokeStyle = 'black'
                ctx.stroke()

            }
            //console.log(count)
            if (count > 0) {
                recurseTriangleUp(ax, ay, (ax + bx) / 2, (ay + by) / 2, (ax + cx) / 2, darken(color), count - 1, ctx);
                recurseTriangleUp((ax + bx) / 2, (ay + by) / 2, bx, by, (bx + cx) / 2, darken(color), count - 1, ctx);
                recurseTriangleUp((ax + cx) / 2, (ay + by) / 2, (bx + cx) / 2, by, cx, darken(color), count - 1, ctx);
            }
            
        }
        function recurseTriangleRight(ax: number, ay: number, bx: number, by: number, cy: number, color: Color, count: number, ctx: CanvasRenderingContext2D): void{
            ctx.beginPath()
            ctx.moveTo((ax + bx) / 2, (ay + by) / 2)
            ctx.lineTo((ax + bx) / 2, (ay + cy) / 2)
            ctx.lineTo(bx, (cy + by) / 2)
            ctx.lineTo((ax + bx) / 2, (ay + by) / 2)
            if (color) {
                ctx.fillStyle = "" + (color)
                ctx.fill()
                ctx.strokeStyle = 'black'
                ctx.stroke()

            }
            //console.log(count)
            if (count > 0) {
                recurseTriangleRight(ax, ay, (ax + bx) / 2, (ay + by) / 2, (ay + cy) / 2, darken(color), count - 1, ctx);
                recurseTriangleRight((ax + bx) / 2, (ay + cy) / 2, bx, (cy + by) / 2, cy, darken(color), count - 1, ctx);
                recurseTriangleRight((ax + bx) / 2, (ay + by) / 2, bx, by, (cy + by) / 2, darken(color), count - 1, ctx);
            }
            
            
        }
        


        

        // if we've clicked, add code draw the rubber band
        if (this.clickStart) {
            this.ctx.strokeStyle = "gray"
            if (this.mousePosition != null) {
                const m = this.mousePosition
                this.ctx.strokeRect(this.clickStart.x, this.clickStart.y, m.x - this.clickStart.x, m.y - this.clickStart.y)
            }
        }
        if (this.m && this.n) {
            const m = this.clickStart
            const n = this.clickEnd
            this.ctx.strokeStyle = 'black'
            this.ctx.strokeRect(this.m.x, this.m.y, this.n.x - this.m.x, this.n.y - this.m.y)
            this.ctx.beginPath()
            this.ctx.moveTo(this.m.x, this.m.y)
            this.ctx.lineTo(this.n.x, this.n.y)
            this.ctx.stroke()
            this.ctx.beginPath()
            this.ctx.moveTo(this.m.x, this.n.y)
            this.ctx.lineTo(this.n.x, this.m.y)
            this.ctx.stroke()

            if(this.randCol) {
                if (this.n.x - this.m.x > this.n.y - this.m.y) {
                    this.triangleStructure.push({"color": this.randCol, "corner1": this.m.x, "corner2": this.m.y, "corner3": this.n.x, "corner4": this.n.y, "rec": (this.m.y - this.n.y) / 128})
                } else {
                    this.triangleStructure.push({"color": this.randCol, "corner1": this.m.x, "corner2": this.m.y, "corner3": this.n.x, "corner4": this.n.y, "rec": (this.m.x - this.n.x) / 128})
                }
            }
            for (let x of this.triangleStructure) {
                this.ctx.strokeStyle = 'black'
                this.ctx.strokeRect(x.corner1, x.corner2, x.corner3 - x.corner1, x.corner4 - x.corner2)
                this.ctx.beginPath()
                this.ctx.moveTo(x.corner1, x.corner2)
                this.ctx.lineTo(x.corner3, x.corner4)
                this.ctx.stroke()
                this.ctx.beginPath()
                this.ctx.moveTo(x.corner1, x.corner4)
                this.ctx.lineTo(x.corner3, x.corner2)
                this.ctx.stroke()
                
                this.ctx.beginPath()
                this.ctx.moveTo(x.corner1, (x.corner4 - x.corner2) / 2 + x.corner2)
                this.ctx.lineTo((x.corner1 + ((x.corner1 + x.corner3) / 2 - x.corner1) / 2), x.corner4 - (((x.corner2 + x.corner4) / 2 - x.corner2) / 2))
                this.ctx.lineTo((x.corner1 + ((x.corner1 + x.corner3) / 2 - x.corner1) / 2), x.corner2 + (((x.corner2 + x.corner4) / 2 - x.corner2) / 2))
                this.ctx.lineTo(x.corner1, (x.corner4 - x.corner2) / 2 + x.corner2)
                if (this.randCol) {
                    this.ctx.fillStyle = "" + x.color
                    this.ctx.fill()
                    this.ctx.strokeStyle = 'black'
                    this.ctx.stroke()
                }

                this.ctx.beginPath()
                this.ctx.moveTo(x.corner3, (x.corner2 - x.corner4) / 2 + x.corner4)
                this.ctx.lineTo((x.corner3 + ((x.corner3 + x.corner1) / 2 - x.corner3) / 2), x.corner2 - (((x.corner4 + x.corner2) / 2 - x.corner4) / 2))
                this.ctx.lineTo((x.corner3 + ((x.corner3 + x.corner1) / 2 - x.corner3) / 2), x.corner4 + (((x.corner4 + x.corner2) / 2 - x.corner4) / 2))
                this.ctx.lineTo(x.corner3, (x.corner2 - x.corner4) / 2 + x.corner4)
                if (this.randCol) {
                    this.ctx.fillStyle = "" + x.color
                    this.ctx.fill()
                    this.ctx.strokeStyle = 'black'
                    this.ctx.stroke()
                }

                this.ctx.beginPath()
                this.ctx.moveTo(x.corner1 + ((x.corner3 - x.corner1) / 2), x.corner2)
                this.ctx.lineTo((x.corner3 + ((x.corner3 + x.corner1) / 2 - x.corner3) / 2), x.corner2 - (((x.corner4 + x.corner2) / 2 - x.corner4) / 2))
                this.ctx.lineTo((x.corner1 + ((x.corner1 + x.corner3) / 2 - x.corner1) / 2), x.corner2 + (((x.corner2 + x.corner4) / 2 - x.corner2) / 2))
                this.ctx.lineTo(x.corner1 + ((x.corner3 - x.corner1) / 2), x.corner2)
                if (this.randCol) {
                    this.ctx.fillStyle = "" + x.color
                    this.ctx.fill()
                    this.ctx.strokeStyle = 'black'
                    this.ctx.stroke()
                }
                this.ctx.beginPath()
                this.ctx.moveTo(x.corner3 + ((x.corner1 - x.corner3) / 2), x.corner4)
                this.ctx.lineTo((x.corner1 + ((x.corner1 + x.corner3) / 2 - x.corner1) / 2), x.corner4 - (((x.corner2 + x.corner4) / 2 - x.corner2) / 2))
                this.ctx.lineTo((x.corner3 + ((x.corner3 + x.corner1) / 2 - x.corner3) / 2), x.corner4 + (((x.corner4 + x.corner2) / 2 - x.corner4) / 2))
                this.ctx.lineTo(x.corner3 + ((x.corner1 - x.corner3) / 2), x.corner4)
                if (this.randCol) {
                    this.ctx.fillStyle = "" + x.color
                    this.ctx.fill()
                    this.ctx.strokeStyle = 'black'
                    this.ctx.stroke()
                }
                if (x.color) {
                    recurseTriangleUp((x.corner1 + x.corner3) / 2, (x.corner2 + x.corner4) / 2, x.corner3, x.corner2, x.corner1, x.color, x.rec - 1, this.ctx)
                    recurseTriangleUp((x.corner1 + x.corner3) / 2, (x.corner2 + x.corner4) / 2, x.corner1, x.corner4, x.corner3, (x.color), x.rec - 1, this.ctx);
                    recurseTriangleRight((x.corner1 + x.corner3) / 2, (x.corner2 + x.corner4) / 2, x.corner1, x.corner2, x.corner4, (x.color), x.rec - 1, this.ctx)
                    recurseTriangleRight((x.corner1 + x.corner3) / 2, (x.corner2 + x.corner4) / 2, x.corner3, x.corner4, x.corner2, (x.color), x.rec - 1, this.ctx)
                }

                
                
            }
            

        }

        // do it again!  and again!  AND AGAIN!  AND ...       
        requestAnimationFrame(() => this.render());
    }
    
    constructor (public canv: HTMLCanvasElement, public ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.rects = new Array(0)  // 0 sized array
        this.points = new ps.PointSet()
 

        // All interaction in browsers is done via event handlers.  Setting
        // "onmousedown", "onmouseup", "onmousemove", and "onmouseout" on
        // the Canvas DOM element to a function will cause that function to
        // be called when the appropriate action happens.

        canv.onmousedown = (ev: MouseEvent) => {
            // this method is called when a mouse button is pressed.
            var mousePosition = Drawing.offset(ev);
            this.clickStart = mousePosition        
            this.mousePosition = mousePosition
        }
        
        canv.onmouseup = (ev: MouseEvent) => {
            // this method is called when a mouse button is released.
            const clickEnd = Drawing.offset(ev);

            // **** TODO *****
            // add code here to react to mouse up events
            this.randCol = randomColor()
            this.m = clickEnd
            this.n = this.clickStart
            this.clickStart = null;
            this.clickEnd = clickEnd
        }
        
        canv.onmousemove = (ev: MouseEvent) => {
            // this method is called when the mouse moves.   
            const mouse = Drawing.offset(ev);
            this.mousePosition = mouse 
        }
        
        canv.onmouseout = (ev: MouseEvent) => {
            // this method is called when the mouse goes out of
            // the window.  
            this.mousePosition = null;
            this.clickStart = null;
        }
    }
}

// a global variable for our state.  We implement the drawing as a class, and 
// will have one instance
var myDrawing: Drawing;

// main function that we call below.
// This is done to keep things together and keep the variables created self contained.
// It is a common pattern on the web, since otherwise the variables below woudl be in 
// the global name space.  Not a huge deal here, of course.

function exec() {
    // find our container
    var div = document.getElementById("drawing");

    if (!div) {
        console.warn("Your HTML page needs a DIV with id='drawing'")
        return;
    }

    // let's create a canvas and to draw in
    var canv = document.createElement("canvas");
    let ctx = canv.getContext("2d");
    if (!ctx) {
        console.warn("our drawing element does not have a 2d drawing context")
        return
    }
    
    div.appendChild(canv);

    canv.id = "main";
    canv.style.width = "100%";
    canv.style.height = "100%";
    canv.width  = canv.offsetWidth;
    canv.height = canv.offsetHeight;

    window.addEventListener('resize', (event) => {
        canv.width  = canv.offsetWidth;
        canv.height = canv.offsetHeight;
    });
    

    // create a Drawing object
    myDrawing = new Drawing(canv, ctx);
    
    // kick off the rendering!
    myDrawing.render(); 
}

exec()