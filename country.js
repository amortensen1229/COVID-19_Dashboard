
//==========================================//
////// MINI CLASS - Country Information //////
//==========================================//

class Country {
  constructor(TD, ND, TR, NR, TC, NC, name) {
    this.total_deaths = TD;
    this.new_deaths = ND;
    this.new_recovered = NR;
    this.total_recovered = TR;
    this.total_cases = TC;
    this.new_cases = NC;
    this.name = name;
  }
}