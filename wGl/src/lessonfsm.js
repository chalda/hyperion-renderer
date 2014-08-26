// Copyright (C) 2014 Arturo Mayorga
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy 
// of this software and associated documentation files (the "Software"), to deal 
// in the Software without restriction, including without limitation the rights 
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
// copies of the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
// SOFTWARE.

/**
 * @return {FsmState}
 * @param {GContext}
 */
function createLesson( context )
{
    var scene = context.getScene();
    var hud = context.getHud();
	var ret = new FsmMachine();
	var oData = new PenLessonOperatingData( context );
	
	ret.addState("Load", new LoadState( oData ));
	ret.addState("Explore", new ExploreState( oData ));
	ret.addState("Clean", new CleanState( oData ));
	
	ret.addTransition( "Load", "loadComplete", "Explore" );
	ret.addTransition( "Explore", "startAsm", "Asm" );
	
	ret.addTransition( "Load", "exitReq", "Clean" );
	ret.addTransition( "Explore", "exitReq", "Clean" );
	
	ret.setName("Pen");
	ret.setEnterState("Load");
	return ret;
}

/**
 * @constructor
 * @param {GContext}
 */
function PenLessonOperatingData( context )
{
    this.context = context;
    this.humanoidAnimator = undefined;
}
 
/**
 * @param {ArmatureAnimator}
 */
PenLessonOperatingData.prototype.setHAnimator = function ( animator )
{
    this.humanoidAnimator = animator;
};

/**
 * @return {ArmatureAnimator}
 */
PenLessonOperatingData.prototype.getHAnimator = function ()
{
    return this.humanoidAnimator;
};

/**
 * @constructor
 * @extends {FsmMachine}
 * @implements {GObjLoaderObserver}
 * @implements {ThreejsLoaderObserver}
 * @param {PenLessonOperatingData}
 */
function CleanState( oData )
{
    this.scene = oData.context.getScene();
}

CleanState.prototype = Object.create( FsmMachine.prototype );

/**
 * This function is called each time this state is entered
 */
CleanState.prototype.enter = function () 
{
    var children = this.scene.getChildren();
	for (var len = children.length; len > 0; children = this.scene.getChildren(), len = children.length )
	{
		children[0].deleteResources(); 
		this.scene.removeChild( children[0] );
	}
	
	while ( this.scene.removeLight(0) ){}
	
	var materials = this.scene.getMaterials();
	
	for ( var i in materials )
	{
	    this.scene.removeMaterial( materials[i] );
	    materials[i].deleteResources();
	}
};

/**
 * This function is called each time the state is exited
 */
CleanState.prototype.exit = function () 
{
};

/**
 * Update this state
 * @param {number} Number of milliseconds since the last update
 */
CleanState.prototype.update = function ( time ) 
{
    this.fireSignal("cleanComplete");
};

/**
 * @constructor
 * @extends {FsmMachine}
 * @implements {GObjLoaderObserver}
 * @implements {ThreejsLoaderObserver}
 * @param {PenLessonOperatingData}
 */
function LoadState( oData ) 
{
    this.scene = oData.context.getScene();
	this.hud = oData.context.getHud();
	this.oData = oData;
	
	
}

LoadState.prototype = Object.create( FsmMachine.prototype );

/**
 * This function is called each time this state is entered
 */
LoadState.prototype.enter = function () 
{
    var hChildren = this.hud.children;
	var len = hChildren.length;
	for (var i = 0; i < len; ++i)
	{
		this.hud.removeChild(hChildren[i]);
	} 
    
    
    this.loadCount = 0;
    this.officeGroup = new GGroup( "officeGroup" ); 
	
	var officeTransform = mat4.create();
	mat4.scale(officeTransform, officeTransform, [4, 4, 4]);
	this.officeGroup.setMvMatrix(officeTransform);
	
	this.scene.addChild(this.officeGroup); 
	
	this.envLoader = new GObjLoader(this.scene, this.officeGroup);
	this.envLoader.setObserver(this);
	this.envLoader.enableAutoMergeByMaterial(); 
    
    
	this.envLoader.loadObj("assets/3d/apartment/a1/", "sheldon.obj"); 

	this.ui = {};
	var bg = new GHudRectangle();
	bg.setColor(0, .2, 0, 1);
	this.hud.addChild(bg);
	
	var bg2 = new GHudRectangle();
	bg2.setColor(.1, .2, .1, .9);
	this.hud.addChild(bg2);
	bg2.setDrawRec(0, 0, 1, .7);
	
	var progressBg = new GHudRectangle();
	progressBg.setColor(1, 1, 1, .02);
	progressBg.setDrawRec(0, 0, .7, .05);
	this.hud.addChild(progressBg);
	
	var progressFg = new GHudRectangle();
	progressFg.setColor(1, 1, 1, .3);
	progressFg.setDrawRec(0, 0, 0, .05);
	this.hud.addChild(progressFg);
	
	this.ui.components = [bg, bg2, progressBg, progressFg];
	this.ui.pFg = progressFg;
	
	this.scene.setVisibility( false );
	
	var camera = this.scene.getCamera();
	camera.setLookAt(4.232629776000977*4, 2.6432266235351562*4, 0.2486426830291748*4);
	camera.setUp(-0.09341227263212204, 0.9805285334587097, 0.17273758351802826);
	camera.setEye(0, 7, 0);
};

/**
 * This function is called each time the state is exited
 */
LoadState.prototype.exit = function () 
{
	var len = this.ui.components.length;
	for (var i = 0; i < len; ++i)
	{
		this.hud.removeChild(this.ui.components[i]);
	} 
	
	 
	
	var light0 = new GLight();
	var light1 = new GLight();
	var light2 = new GLight();
	var light3 = new GLight();
	var light4 = new GLight();
	var light5 = new GLight();
	/*var light6 = new GLight();
	var light7 = new GLight();
	var light8 = new GLight();
	
	light0.setPosition(-18, 28.25, 16);
	light1.setPosition(-12, 28.25, -22);
	light2.setPosition(-6, 28.25, 16);
	light3.setPosition(0, 28.25, -22);*/
	
	var h = 15.877;
	
	light0.setPosition(0, h, 0);
	light1.setPosition(-10, h, -7.9);
	light2.setPosition(-20.4, h, -6.4);
	light3.setPosition(9.9, h, -21.6);
	light4.setPosition(20.2, h, -6);
	light5.setPosition(3, 12, -28);
	
	
	
	//light0.setPosition(-18, 28.25, 8);
	//light1.setPosition(-12, 28.25, -2);
	//light2.setPosition(-6, 28.25, 8);
	//light3.setPosition(0, 28.25, -2);
	//light4.setPosition(6, 28.25, 8);
	//light5.setPosition(12, 28.25, -2);
	/*light6.setPosition(18, 28.25, 8);
	light7.setPosition(24, 28.25, -2);
	light8.setPosition(30, 28.25, 8);*/
	
	
	this.scene.addLight(light0);
	this.scene.addLight(light1);
	this.scene.addLight(light2);
	this.scene.addLight(light3);
	this.scene.addLight(light4);
	this.scene.addLight(light5);
	
	this.scene.setVisibility( true );
};

/**
 * Update this state
 * @param {number} Number of milliseconds since the last update
 */
LoadState.prototype.update = function ( time ) 
{
    this.envLoader.update(time);
};
 
 /**
  * This function gets called whenever the observed loader completes the loading process
  * @param {GObjLoader} Loader object that just finished loading its assets
  */
LoadState.prototype.onObjLoaderCompleted = function ( loader ) 
{ 
	if (this.loadCount === undefined)
	{
		this.loadCount = 1;
	}
	else
	{
		++this.loadCount;
	}
	
	if (this.loadCount >= 1)
	{
		this.fireSignal("loadComplete");
	}
};

/**
 * This function gets called whenever the observed loader makes progress
 * @param {GObjLoader} Loader object that is being observed
 * @param {number} progress Progress value
 */
LoadState.prototype.onObjLoaderProgress = function ( loader, progress ) 
{
	var tProgress = this.envLoader.totalProgress ;
	this.ui.pFg.setDrawRec( .7*(tProgress-1), 0, tProgress*.7, .05);
};

/**
 * @constructor
 * @implements {FsmState}
 * @implements {IContextMouseObserver}
 * @param {PenLessonOperatingData}
 */
function ExploreState( oData ) 
{
    this.scene = oData.context.getScene();
	this.hud = oData.context.getHud();
	this.oData = oData;
	this.timeR = 0;
	
}

ExploreState.prototype = Object.create( FsmMachine.prototype );

/**
 * Set the signal observer
 * @param {FsmSignalObserver} observer The new observer to be used
 */
ExploreState.prototype.setSignalObserver = FsmState.prototype.setSignalObserver;

/**
 * Fire the transition signal
 * @param {string} signal Name of the signal to fire
 */
ExploreState.prototype.fireSignal = FsmState.prototype.fireSignal;

/**
 * @param {MouseEvent}
 * @param {number}
 */
ExploreState.prototype.onMouseDown = function( ev, objid ) 
{
    this.fireSignal("exitReq");
};

/**
 * @param {MouseEvent}
 */
ExploreState.prototype.onMouseUp = function( ev ) {};

/**
 * @param {MouseEvent}
 */
ExploreState.prototype.onMouseMove = function( ev ) {};

/**
 * This function is called whenever we enter the explore state
 */
ExploreState.prototype.enter = function () 
{
	this.camController = new GCameraController();
	this.camController.bindCamera(this.scene.getCamera());
    
    this.oData.context.addMouseObserver( this );
};

/**
 * This function is called whenever we exit the explore state
 */
ExploreState.prototype.exit = function () 
{
	this.camController = undefined;
	
	this.oData.context.removeMouseObserver( this );
};

/**
 * This is the update function for the explore state
 * @param {number} number of milliseconds since the last update
 */
ExploreState.prototype.update = function ( time ) 
{
	this.camController.update( time );
};



