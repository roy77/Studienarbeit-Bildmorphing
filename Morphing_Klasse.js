class Morphing
{
    constructor()
    {
        this.QuellpunkteM = [];
        this.ZielpunkteM = [];
        this.width;
        this.height;
        this.maskCanvas;
        this.maskCtx;
        this.TransformationCtx;
        this.teilverhältnis;
        this.Bildausschnitte = [];
        this.j = 1;
        this.Morphs = [];
        this.transformierteQuellbilder = [];
        this.transformierteZielbilder = [];
    }

    //Initialisierung der Klasse
    init(maskCanvasID, QuellPunkte, ZielPunkte)
    {
        //Punkte initial übertragen, damit Morphing auch ohne Mausbewegung gestartet werden kann
        this.QuellpunkteM = [...QuellPunkte]; 
        this.ZielpunkteM = [...ZielPunkte];

        //maskCanvas wird für das Isolieren und Abspeichern der Bildsegmente verwendet
        this.maskCanvas = document.getElementById(maskCanvasID);
        this.maskCanvas.style.display="none";  
        this.maskCtx = this.maskCanvas.getContext('2d');
        this.maskCtx.font = "16px Arial";
 
        return this;
    }

    //Übertragung der Daten aus den BildBoxen
    uebertragen(canvasID,PunkteAusBildBox,TeilverhältnisAusBoxen) 
    {
        this.teilverhältnis = TeilverhältnisAusBoxen;

        if(canvasID == 'QuellCanvas')
        {
            this.QuellpunkteM = [...PunkteAusBildBox]; 
        }
        
        if(canvasID == 'ZielCanvas')
        {
            this.ZielpunkteM = [...PunkteAusBildBox];  
        }
    }

    NetzInterpolation(Quellpunkte, Zielpunkte, step)
    {   
      var kZwischenpunkte = this.deepCopy(Quellpunkte); 
      for(let i=1; i<=25; i++)
      {   
        kZwischenpunkte[i].x = Quellpunkte[i].x *step + (1-step)* Zielpunkte[i].x;
        kZwischenpunkte[i].y = Quellpunkte[i].y *step + (1-step)* Zielpunkte[i].y;
      }
      return kZwischenpunkte;
    }
  
    calcMorph(bildMat1,bildMat2,n){
        for(let i=0; i<n; i++){
          
          var Zwischenpunkte = this.NetzInterpolation(this.QuellpunkteM, this.ZielpunkteM, 1-i/n);
          if(i==0) this.transformierteQuellbilder[i]=bildMat1
          else this.transformierteQuellbilder[i] = this.transformiereAusschnitte(this.QuellpunkteM, Zwischenpunkte, bildMat1);
          
          if(i==(n-1)) this.transformierteZielbilder[i]=bildMat2
          else this.transformierteZielbilder[i] = this.transformiereAusschnitte(this.ZielpunkteM, Zwischenpunkte, bildMat2);
          this.Morphs[i] = new cv.Mat(); 
          cv.addWeighted(this.transformierteQuellbilder[i], 1-i/n, this.transformierteZielbilder[i], i/n, 0,this.Morphs[i])         
        } 
    }
    
    getResult(index){
      return this.Morphs[index];
    }

    getSource(index){
      return this.transformierteQuellbilder[index];
    }

    getDestination(index){
      return this.transformierteZielbilder[index];
    }

    //Transformation der einzelnen Ausschnitte
    transformiereAusschnitte(Quellpunkte, Zielpunkte, src)
    {  
        this.width=src.cols
        this.height=src.rows
        this.maskCanvas.width = this.width;
        this.maskCanvas.height = this.height;

        let transformiertesBild; 
        this.z1 = 0;
        this.z2 = 16;

        //obere Dreiecke
        this.j = 0;
        for(let z=1; z<=16; z++)
        {   
            this.maskCtx.globalCompositeOperation = "source-over";
            this.maskCtx.clearRect(0, 0, this.width, this.height);

            switch (z)
            {
                case 5:
                    this.j+=2;
                    break;
                case 9:
                    this.j+=2;
                    break;
        
                case 13:
                    this.j+=2;
                    break;

                default:
                    this.j++;
            }
        this.z1 ++;

        //Vierpunkttransformation
        let dst = new cv.Mat();       
        //Quell- und Zielpunkte abhängig von den Punktearrays als Eingabewerte
        let srcTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Quellpunkte[this.j].x, Quellpunkte[this.j].y, Quellpunkte[this.j+1].x, Quellpunkte[this.j+1].y, Quellpunkte[this.j+6].x, Quellpunkte[this.j+6].y]);
        let dstTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Zielpunkte[this.j].x, Zielpunkte[this.j].y, Zielpunkte[this.j+1].x, Zielpunkte[this.j+1].y, Zielpunkte[this.j+6].x, Zielpunkte[this.j+6].y]);
        //Transformationsmatrix berechnen
        let kernel = cv.getAffineTransform(srcTri, dstTri);
        //Transformation durchführen
        cv.warpAffine(src, dst, kernel, new cv.Size(this.width, this.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());          

        //Dreieck zur Maskierung zeichnen
        this.maskCtx.lineWidth = 0;
        this.maskCtx.fillStyle = "#FFFFFF";
        this.maskCtx.beginPath();
        this.maskCtx.moveTo(Zielpunkte[this.j].x, Zielpunkte[this.j].y);
        this.maskCtx.lineTo(Zielpunkte[this.j+1].x, Zielpunkte[this.j+1].y);
        this.maskCtx.lineTo(Zielpunkte[this.j+6].x, Zielpunkte[this.j+6].y);
        this.maskCtx.closePath();
        this.maskCtx.stroke();
        this.maskCtx.fill();
        let mask=cv.imread(this.maskCanvas);
        let res = new cv.Mat();

        cv.threshold(mask, mask, 1, 255, cv.THRESH_BINARY);
        cv.cvtColor(mask, mask, cv.COLOR_RGBA2GRAY);
        cv.bitwise_and(dst, dst, res, mask);
        this.Bildausschnitte[this.z2] =res;


        //Segmente einlesen und abspeichern
        this.Bildausschnitte[this.z1] = res;
        }

        //untere Dreiecke
        this.l = 0;
        for(let z=1; z<=16; z++)
        {   
          this.maskCtx.globalCompositeOperation = "source-over";
          this.maskCtx.clearRect(0, 0, this.width, this.height);

          switch (z)
          {
              case 5:
                  this.l+=2;
                  break;
              case 9:
                  this.l+=2;
                  break;
      
              case 13:
                  this.l+=2;
                  break;
              default:
                  this.l++;
          }
          this.z2 ++;
              
          //Vierpunkttransformation
          let dst = new cv.Mat();        
          //Quell- und Zielpunkte abhängig von den Punktearrays als Eingabewerte
          let srcTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Quellpunkte[this.l].x, Quellpunkte[this.l].y, Quellpunkte[this.l+5].x, Quellpunkte[this.l+5].y, Quellpunkte[this.l+6].x, Quellpunkte[this.l+6].y]);
          let dstTri = cv.matFromArray(3, 1, cv.CV_32FC2, [Zielpunkte[this.l].x, Zielpunkte[this.l].y, Zielpunkte[this.l+5].x, Zielpunkte[this.l+5].y, Zielpunkte[this.l+6].x, Zielpunkte[this.l+6].y]);
          //Transformationsmatrix berechnen
          let kernel = cv.getAffineTransform(srcTri, dstTri);
          //Transformation durchführen
          cv.warpAffine(src, dst, kernel, new cv.Size(this.width, this.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());          

          //Dreieck zur Maskierung zeichnen
          this.maskCtx.lineWidth = 0;
          this.maskCtx.fillStyle = "#FFFFFF";
          this.maskCtx.beginPath();
          this.maskCtx.moveTo(Zielpunkte[this.l].x, Zielpunkte[this.l].y);
          this.maskCtx.lineTo(Zielpunkte[this.l+5].x, Zielpunkte[this.l+5].y);
          this.maskCtx.lineTo(Zielpunkte[this.l+6].x, Zielpunkte[this.l+6].y);
          this.maskCtx.closePath();
          this.maskCtx.stroke();
          this.maskCtx.fill();
          let mask=cv.imread(this.maskCanvas);
          let res = new cv.Mat();

          cv.threshold(mask, mask, 1, 255, cv.THRESH_BINARY);
          cv.cvtColor(mask, mask, cv.COLOR_RGBA2GRAY);
          cv.bitwise_and(dst, dst, res, mask);
          this.Bildausschnitte[this.z2] =res;
        }

        this.maskCtx.clearRect(0, 0, this.width, this.height);

        let src1 = cv.imread(this.maskCanvas);
        //  

        //Bildausschnitte zum Gesamtbild aufaddieren 
        for(let i=1; i<=32;i++)
        {
            let src2 = this.Bildausschnitte[i];
            let mask = new cv.Mat();
            cv.cvtColor(src2, mask, cv.COLOR_RGBA2GRAY, 0);
            cv.threshold(mask, mask, 1, 255, cv.THRESH_BINARY);
            cv.bitwise_and(src2, src2, src1, mask);
        }
        //Ergebnisbild ausgeben
        cv.imshow(this.maskCanvas,src1,0,0);

        return cv.imread(this.maskCanvas);
    }
   
    //Hilfsfunktionen für tiefes Arraykopieren
    deepCopy(arr)
    {
        let copy = [];
        arr.forEach(elem => {
          if(Array.isArray(elem)){
            copy.push(this.deepCopy(elem))
          }else{
            if (typeof elem === 'object') {
              copy.push(this.deepCopyObject(elem))
          } else {
              copy.push(elem)
            }
          }
        })
        return copy;
    }
      
    deepCopyObject(obj)
    {
        let tempObj = {};
        for (let [key, value] of Object.entries(obj)) {
          if (Array.isArray(value)) {
            tempObj[key] = this.deepCopy(value);
          } else {
            if (typeof value === 'object') {
              tempObj[key] = this.deepCopyObject(value);
            } else {
              tempObj[key] = value
            }
          }
        }
        return tempObj;
    }         
}