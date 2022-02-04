"use strict";



class App extends React.Component {
  constructor(props) {
    super(props);
    // Käytetään samaa tietorakennetta kuin viikkotehtävässä 1, mutta vain jäärogainin-
    // gin joukkueita. Tehdään tämän komponentin tilaan kopio jäärogainingin tiedoista.
    // Tee tehtävässä vaaditut lisäykset ja muutokset tämän komponentin tilaan. Tämä on
    // tehtävä näin, että saadaan oikeasti aikaan kopio eikä vain viittausta samaan
    // tietorakenteeseen. Objekteja ja taulukoita ei voida kopioida vain sijoitusope-
    // raattorilla. Päivitettäessä React-komponentin tilaa on aina vanha tila kopioitava
    // uudeksi tällä tavalla
    // kts. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
    let kilpailu = new Object();
    kilpailu.nimi = data[2].nimi;
    kilpailu.loppuaika = data[2].loppuaika;
    kilpailu.alkuaika = data[2].alkuaika;
    kilpailu.kesto = data[2].kesto;
    kilpailu.leimaustapa = Array.from(data[2].leimaustapa);
    kilpailu.rastit = Array.from(data[2].rastit);
    function kopioi_joukkue(j) {
      let uusij = {};
      uusij.nimi = j.nimi;
      uusij.id = j.id;

      uusij["jasenet"] = Array.from(j["jasenet"]);
      uusij["rastit"] = Array.from(j["rastit"]);
      uusij["leimaustapa"] = Array.from(j["leimaustapa"]);
      return uusij;
    }
    function kopioi_sarja(s) {
      let uusis = {};
      uusis.nimi = s.nimi;
      uusis.alkuaika = s.alkuaika;
      uusis.loppuaika = s.loppuaika;
      uusis.kesto = s.kesto;
      uusis.joukkueet = Array.from(s.joukkueet, kopioi_joukkue);
      return uusis;
    }

    kilpailu.sarjat = Array.from(data[2].sarjat, kopioi_sarja);

    // tuhotaan vielä alkuperäisestä tietorakenteesta rastit ja joukkueet niin
    // varmistuuu, että kopiointi on onnistunut
    function purgeOrigData() {
      for (let i in data[2].rastit) {
        delete data[2].rastit[i];
      }
      for (let sarja of data[2].sarjat) {
        for (let i in sarja.joukkueet) {
          delete sarja.joukkueet[i];
        }
      }
    }
    purgeOrigData();
    //console.log(kilpailu);
    //console.log(data);

    this.state = {
       kilpailu: kilpailu,
       joukkueet: this.luoJoukkueLista(kilpailu.sarjat),
       joukkue: {
        sarja: "",
        id: "",
        jasenet: ["",""],
        nimi: "",
        leimaustapa: [],
        rastit: [],
      }
    };
    return;
  } 

  handleSubmit = e => {
    e.preventDefault();
    const {id, jasenet, leimaustapa, nimi, rastit, sarja} = this.state.joukkue;
    let newJoukkue = {
      id: id,
      jasenet: jasenet.filter(i => i !== ""),
      leimaustapa: leimaustapa,
      nimi: nimi,
      rastit: rastit
    }
    let newKilpailu = this.deepcopyKilpailu();
    const sI = newKilpailu.sarjat.findIndex(i => i.nimi === sarja)
    let joukkueet = newKilpailu.sarjat[sI].joukkueet;

    if (newJoukkue.id === "") {
      newJoukkue.id.luoID;
      joukkueet.push(newJoukkue);
    } else {
      for (let joukkue of joukkueet){
        if (joukkue.id === id){          
          joukkue.jasenet = jasenet.filter(i => i !== ""),
          joukkue.leimaustapa = leimaustapa,
          joukkue.nimi = nimi,
          joukkue.rastit = rastit
        }
      }
    }    

    this.setState({
      kilpailu: newKilpailu,
      joukkueet: this.luoJoukkueLista(newKilpailu.sarjat),
      joukkue: this.tyhjaJoukkue()    
    })
    this.validateForm()
  }

  /**
   * Funktio joka ottaa sisäänsä minkä tahansa joukkueen, ja täyttää
   * sen sarja, id, jasenet, leimaustapa, nimi ja rastit attribuutit
   * tyhjillä arvoilla
   */
  tyhjaJoukkue = () => {    
    let joukkue = {};
    joukkue.sarja = "2h";
    joukkue.id = "";
    joukkue.jasenet = ["",""];
    joukkue.leimaustapa  = [];
    joukkue.nimi = "";
    joukkue.rastit = [];
    return joukkue;
  }

  handleChange = (e) =>{
    const { name, value, id, checked } = e.target;
    let newValue;
    let message = "";
    switch (name) {
      case "nimi":
        newValue = value;
        //Validointi
        if (newValue.trim() === "") message = "Joukkueella on oltava nimi!";
        break;

      case "jasenet":
        //Käsitellään olemassaolevien jäsenten muutos        
        newValue = this.state.joukkue.jasenet.map((jasen, i) => {
          if (id === ("jasen" + i)) jasen = value;
          return jasen;
        });
        newValue = newValue.filter(i => i !== "") //Poistetaan tyhjät taulukosta
        if (newValue.length < 2){ //Lisätään taulukkoon tyhjiä kunnes vähintään 2 paikkaa
          newValue.push("");
          message = "Joukkueessa oltava vähintään 2 kilpailijaa!";
        } else if (newValue.length < 5 ) {          
          newValue.push(""); //Lisätään tyhjä perään jos vähemmän kuin 5 inputtia
        }
        break;

      case "leimaustapa":
        checked
          ? newValue = this.state.joukkue.leimaustapa.concat(value)
          : newValue = this.state.joukkue.leimaustapa.filter(word => word !== value)
        break;

      default:
        newValue = value;
        break;
    }
    this.validateForm();
    let newJoukkue = Object.assign(this.state.joukkue);
    newJoukkue[name] = newValue;
    this.setState({
      joukkue: newJoukkue
    })
  }

  muokkaaJoukkuetta = (e) => {
    e.preventDefault();    
    const nimi = $(e.target).text().trim()     
    const joukkue = this.state.joukkueet
      .find(joukkue => joukkue.nimi.trim() === nimi);
    let newJoukkue = Object.create(joukkue);
    if (newJoukkue.jasenet.length < 5) {
      newJoukkue.jasenet.push("");
    }
    this.setState({ joukkue: newJoukkue });
  }


  //#region Apufunktiot

  componentDidMount() {
    this.validateForm();
  }

  componentDidUpdate(){
    this.validateForm();
  }

  validateForm(){
    let message = "";
    this.state.joukkue.nimi.trim() === ""
      ? message = "Joukkueella on oltava nimi!"
      : message = ""
    $("#joukkueNimi")[0].setCustomValidity(message);

    this.state.joukkue.leimaustapa.length === 0
      ? message = "Oltava vähintään yksi leimaustapa!"
      : message = ""
    $("#GPS")[0].setCustomValidity(message);

    this.state.joukkue.jasenet.length < 2
      ? message = "Joukkueessa oltava vähintään 2 kilpailijaa!"
      : message = ""
    $("#jasen1")[0].setCustomValidity(message);
  }



  deepcopyKilpailu(){
    const kilpailu = this.state.kilpailu;
    let newKilpailu = new Object();
    newKilpailu.nimi = kilpailu.nimi;
    newKilpailu.loppuaika = kilpailu.loppuaika;
    newKilpailu.alkuaika = kilpailu.alkuaika;
    newKilpailu.kesto = kilpailu.kesto;
    newKilpailu.leimaustapa = Array.from(kilpailu.leimaustapa);
    newKilpailu.rastit = Array.from(kilpailu.rastit);
    function kopioi_joukkue(j) {
      let uusij = {};
      uusij.nimi = j.nimi;
      uusij.id = j.id;

      uusij["jasenet"] = Array.from(j["jasenet"]);
      uusij["rastit"] = Array.from(j["rastit"]);
      uusij["leimaustapa"] = Array.from(j["leimaustapa"]);
      return uusij;
    }
    function kopioi_sarja(s) {
      let uusis = {};
      uusis.nimi = s.nimi;
      uusis.alkuaika = s.alkuaika;
      uusis.loppuaika = s.loppuaika;
      uusis.kesto = s.kesto;
      uusis.joukkueet = Array.from(s.joukkueet, kopioi_joukkue);
      return uusis;
    }
    newKilpailu.sarjat = Array.from(kilpailu.sarjat, kopioi_sarja);
    return newKilpailu;
  }

  /**
   * @summary: Luo uniikin ID-numeron.
   * @returns {int}: Uniikki 16-numeroinen ID-numero jota ei löydy tietokannasta
   */
  luoID() {
    let id = Math.floor(Math.random() * Math.floor(10000000000000000));
    do {
      var unique = false; //Pitää olla var, jotta pääsee käsiksi for-loopissa
      unique = this.onUniikkiID(id, this.state.kilpailu.rastit);
      for (let sarja of this.state.kilpailu.sarjat) {
        unique = this.onUniikkiID(id, sarja.joukkueet);
      }
    } while (!unique);
    return id;
  }

  /**
  * @summary: Tarkistaa, että annettua ID:tä ei löydy annetusta datasta.
  * @param {int} id: 16-numeroinen tarkastettava ID-numero
  * @param {JSON} iterable: Iteroitavaa JSON-dataa joka tarkistetaan.
  * @return {boolean}: Tosi jos ID on uniikki, epätosi jos löytyy sama ID-numero
  */
  onUniikkiID(id, iterable) {
    for (let i of iterable) {
      if (id === i.id) {
        return false;
      }
    }
    return true;
  }

  luoJoukkueLista (sarjat){
    let joukkueet = [];
    for (const sarja of sarjat){
      for (const joukkue of sarja.joukkueet){
        let newJoukkue = joukkue;
        newJoukkue.sarja = sarja.nimi;
        joukkueet.push(newJoukkue);
      }
    }
    joukkueet.sort((a,b) => {
      const nameA = a.nimi.toUpperCase();
      const nameB = b.nimi.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
    return joukkueet;
}

  //#endregion

  render() {

    return (
      <div className="ylin">
        <LisaaJoukkue 
          updateData={this.updateData}
          joukkue={this.state.joukkue}
          handleSubmit = {this.handleSubmit} 
          handleChange = {this.handleChange}/>
        <ListaaJoukkueet 
          joukkueet={this.state.joukkueet} 
          muokkaaJoukkuetta={this.muokkaaJoukkuetta} />
      </div>
    )
  }
}

function ListaaJoukkueet(props){
    return (
      <div className="joukkueListaus">
        <h1>Joukkueet</h1>
        <ul>
          {props.joukkueet.map((joukkue) => {
            return (
              <JoukkueenTiedot 
                joukkue={joukkue} 
                muokkaaJoukkuetta={props.muokkaaJoukkuetta}
                key={joukkue.nimi.trim()}/>
            );
          })}
        </ul>
      </div>
    )
}

function JoukkueenTiedot(props){
  const {joukkue} = props;
  const pilkuta = (array) => {
    let output = "";
    for (let i = 0; i < array.length-1; i++){
      output += array[i] + ", "
    }
    output += array[array.length-1]
    return output;
  };
  return (
    <li>
      <a href="" onClick={props.muokkaaJoukkuetta}>{joukkue.nimi.trim()}</a>
      <div>
        {joukkue.sarja + " "}
        {"(" + pilkuta(joukkue.leimaustapa) + ")"}
      </div>
      <JoukkueenJasenet
        jasenet = {joukkue.jasenet} />
    </li>
  )
}

function JoukkueenJasenet(props){
  return (
    <ul>
      {props.jasenet.map((jasen, i) => {
        return(
          <li key={jasen + i}>
            {jasen}
          </li>
        )
      })}
    </ul>
  )
}

function LisaaJoukkue(props){
  return (
    <form onSubmit={e => props.handleSubmit(e)}>
      <h1>Lisää joukkue</h1>
      <fieldset><legend>Joukkueen tiedot</legend>

        <NimiField
          value={props.joukkue.nimi}
          handleChange={(e) => props.handleChange(e)}
        />
        <LeimaustavatField
          leimausState={props.joukkue.leimaustapa}
          handleChange={(e) => props.handleChange(e)}
        />
        <SarjaField
          sarjaState={props.joukkue.sarja}
          handleChange={(e) => props.handleChange(e)}
        />
      </fieldset>

      <fieldset><legend>Jäsenet</legend>
        <JasenetField
          jasenet={props.joukkue.jasenet}
          handleChange={e => props.handleChange(e)}
        />
      </fieldset>

      <button>Tallenna</button>
    </form>
  )
}

//#region Input Components
function NimiField(props) {
  return (
    <div className="input-div">
      <label>Nimi</label>
      <input
        id="joukkueNimi"
        type="text"
        name="nimi"
        value={props.value}
        onChange={props.handleChange}
      />
    </div>)
}

function LeimaustavatField(props) {
  const leimaustavat = ["GPS", "NFX", "QR", "Lomake"];
  return (
    <div className="input-div">
      <label>Leimaustapa</label>
      <ul id="leimaustavat">

        {leimaustavat.map((val, i) => {
          return (
            <li key={val}>
              <label>{val}
                <input
                  type="checkbox"
                  name="leimaustapa"
                  value={val}
                  checked={props.leimausState.includes(val)}
                  id={val}
                  onChange={props.handleChange}
                />
              </label>
            </li>
          );
        })}

      </ul>
    </div>
  )
}

function SarjaField(props) {
  const sarjat = ["2h", "4h", "8h"];
  return (
    <div className="input-div">
      <label>Sarja</label>
      <ul>
        {sarjat.map((val, i) => {
          return (
            <li key={val}>
              <label>{val}
                <input
                  type="radio"
                  name="sarja"
                  value={val}
                  checked={props.sarjaState === val}
                  id={val}
                  onChange={props.handleChange}
                />
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  )
}

function JasenetField(props) {
  return (
    <div>
      {props.jasenet.map((val, i) => {
        return (
          <JasenInput
            val={val}
            i={i} 
            handleChange={props.handleChange} 
            key={"jasen" + (i)}
          />
        );
      })}
    </div>
  )
}

function JasenInput(props) {
  const {i, val, handleChange} = props;
  return(
    <div className="input-div">
      <label>{"Jäsen " + (i + 1)}</label>
      <input
        id={"jasen" + (i)}
        type="text"
        value={val}
        name="jasenet"
        onChange={handleChange}
      />
    </div>
  )
}
//#endregion




ReactDOM.render(
  <App />,
  document.getElementById('root')

);
