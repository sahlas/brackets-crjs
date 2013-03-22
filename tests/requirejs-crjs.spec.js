require(['crjs.spec'], function(sut){
      describe("A spec", function() {
      var foo;
    
      beforeEach(function() {
        foo = 0;
        foo += 1;
      });
    
      it("is just a function, so it can contain any code", function() {
        expect(foo).toEqual(1);
      });
    });
});
