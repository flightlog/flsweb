import {ParseUtil} from "./DeliveryCreationTestsEditController";

describe('ParseUtil', function () {

    describe('parseDetails ', function () {
        it('replaces the formatted property', function () {
            // arrange
            let deliveryCreationTest = {expectedDeliveryDetailsFormatted: "{\"a\":\"b\"}"};

            // act
            ParseUtil.parseDetails(deliveryCreationTest);

            // assert
            expect(deliveryCreationTest).toEqual({ExpectedDeliveryDetails: {a: "b"}});
        });
    });

    describe('parseDetails ', function () {
        it('formats in pretty print', function () {
            // arrange
            let unformattedObject = {a: "b"};

            // act
            let result = ParseUtil.formatDetails(unformattedObject);

            // assert
            expect(result).toBe("{\n" +
                "  \"a\": \"b\"\n" +
                "}");
        });
    });

});