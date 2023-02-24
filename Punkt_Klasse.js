//Klasse Punkt 
class Punkt{ 
    constructor()
    {
        this.nummer;
        this.x;
        this.y;
        this.wirdGezogen = false;
        this.radius=5;
        this.farbe="black";   
    }
 
    angewählt(px,py)
    {   
        var d = this.abstandRechnen(px, py, this.x, this.y);
        if (d < this.radius+10)
        {
            this.wirdGezogen = true;
            this.farbe = "red"; 
        }
    }

    abstandRechnen(PunktX, PunktY, MausX, MausY)
    {
        return Math.sqrt(Math.pow((PunktX-MausX),2)+Math.pow((PunktY-MausY),2));
    }
}