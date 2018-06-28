var drawning_gateway = require('../../lib/drawning_gateway');

describe("DrawningGateway", function() {

  describe(".load", function() {
    it("must have 20 numbers", function() {
      expect(drawning_gateway.load().length).toBe(20);
    });

    it("must be in order", function() {
      var n = drawning_gateway.load();
      expect(n).toBe(n.sort(function(a, b){return a-b}));
    });
  });

});